pipeline {
    agent any

    options {
        timeout(time: 1, unit: 'HOURS') // Prevents hanging builds from consuming executor hours
        buildDiscarder(logRotator(numToKeepStr: '30')) // Keep artifact logs clean
        disableConcurrentBuilds() // Avoid port conflicts with docker-compose mapping
        ansiColor('xterm') // Enables readable, colored terminal outputs
    }

    environment {
        // Define your Docker Registry credentials ID configured in Jenkins
        REGISTRY_CREDENTIALS_ID = 'docker-hub-credentials'
        REGISTRY_URL            = 'index.docker.io/v1/' // Change if using ECR/GCR/Nexus
        IMAGE_WEB_APP           = 'my-company/my-web-app'
        IMAGE_LINK_SERVICE      = 'my-company/my-link-service'
        
        // Dynamic Ports used during the pipeline lifespan
        DB_PORT                      = '3306'
        LINK_SERVICE_HOST_PORT       = '3000'
        LINK_SERVICE_CONTAINER_PORT  = '3000'
        WEB_APP_HOST_PORT            = '8080'
        WEB_APP_CONTAINER_PORT       = '8080'
    }

    stages {
        stage('Initialize & Extract Meta') {
            steps {
                script {
                    // Extract short commit SHA for deterministic docker tagging
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    echo "Building Artifacts for Commit SHA: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }

        stage('Prepare Environment Configuration') {
            steps {
                // Securely fetch database secrets from Jenkins credentials vault
                withCredentials([usernamePassword(credentialsId: 'app-db-secrets', usernameVariable: 'DB_USER_VAL', passwordVariable: 'DB_PASS_VAL')]) {
                    sh """
                        echo "MYSQL_ROOT_PASSWORD=${DB_PASS_VAL}" > .env
                        echo "MYSQL_DATABASE=login_crud_db" >> .env
                        echo "MYSQL_USER=${DB_USER_VAL}" >> .env
                        echo "MYSQL_PASSWORD=${DB_PASS_VAL}" >> .env
                        echo "DB_PORT=${env.DB_PORT}" >> .env
                        echo "LINK_SERVICE_HOST_PORT=${env.LINK_SERVICE_HOST_PORT}" >> .env
                        echo "LINK_SERVICE_CONTAINER_PORT=${env.LINK_SERVICE_CONTAINER_PORT}" >> .env
                        echo "WEB_APP_HOST_PORT=${env.WEB_APP_HOST_PORT}" >> .env
                        echo "WEB_APP_CONTAINER_PORT=${env.WEB_APP_CONTAINER_PORT}" >> .env
                    """
                }
            }
        }

        stage('Docker Compile & Build') {
            steps {
                echo 'Building Multi-Container Images using Docker Compose...'
                // Build images without cache to ensure dependencies like bcryptjs/mysql2 compiled natively 
                sh 'docker compose build --no-cache'
            }
        }

        stage('Vulnerability Scanning') {
            parallel {
                stage('Scan Link Service') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            sh "trivy image --severity HIGH,CRITICAL --exit-code 1 my-link-service:latest"
                        }
                    }
                }
                stage('Scan Web App') {
                    steps {
                        catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                            sh "trivy image --severity HIGH,CRITICAL --exit-code 1 my-web-app:latest"
                        }
                    }
                }
            }
        }

        stage('Integration & Health Testing') {
            steps {
                echo 'Spinning up multi-container environment...'
                // Starts the stack in detached mode. 
                // Docker Compose will respect the 'depends_on' healthcheck logic from your configuration file.
                sh 'docker compose up -d'
                
                echo 'Awaiting container convergence...'
                script {
                    // Give Docker Compose healthchecks time to flip to "healthy"
                    // Web-app will cascade alive only when link-service and db pass health gates
                    int maxAttempts = 6
                    boolean isHealthy = false
                    
                    for (int i = 0; i < maxAttempts; i++) {
                        String status = sh(script: "docker inspect --format='{{json .State.Health.Status}}' \$(docker compose ps -q web-app)", returnStdout: true).trim()
                        if (status.contains("healthy")) {
                            isHealthy = true
                            echo "Application verified healthy and operational!"
                            break
                        }
                        echo "Waiting for stack convergence... Attempt ${i+1}/${maxAttempts}"
                        sleep 10
                    }
                    
                    if (!isHealthy) {
                        error "Deployment health checks failed. Review system logs."
                    }
                }
            }
        }

        stage('Artifact Registry Promotion') {
            when {
                branch 'main' // Only release images built on your production branch
            }
            steps {
                withCredentials([usernamePassword(credentialsId: "${env.REGISTRY_CREDENTIALS_ID}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "${DOCKER_PASS}" | docker login ${env.REGISTRY_URL} -u "${DOCKER_USER}" --password-stdin
                        
                        # Tag with immutable Git SHA
                        docker tag my-web-app:latest ${env.IMAGE_WEB_APP}:${env.GIT_COMMIT_SHORT}
                        docker tag my-link-service:latest ${env.IMAGE_LINK_SERVICE}:${env.GIT_COMMIT_SHORT}
                        
                        # Tag with latest 
                        docker tag my-web-app:latest ${env.IMAGE_WEB_APP}:latest
                        docker tag my-link-service:latest ${env.IMAGE_LINK_SERVICE}:latest
                        
                        # Push to secure cloud repository
                        docker push ${env.IMAGE_WEB_APP}:${env.GIT_COMMIT_SHORT}
                        docker push ${env.IMAGE_WEB_APP}:latest
                        docker push ${env.IMAGE_LINK_SERVICE}:${env.GIT_COMMIT_SHORT}
                        docker push ${env.IMAGE_LINK_SERVICE}:latest
                    """
                }
            }
        }
    }

    post {
        always {
            echo 'Teardown Processing: Cleaning up pipeline resources...'
            // Ensures orphan containers, anonymous volumes, and temporary networks are completely purged
            sh 'docker compose down -v --orphans'
            // Deletes generated credentials environment configuration file
            sh 'rm -f .env'
        }
        success {
            echo 'Pipeline completed successfully. Artifacts have been promoted.'
        }
        failure {
            echo 'Pipeline failed. Fetching application crash logs:'
            sh 'docker compose logs --tail="50"'
        }
    }
}
