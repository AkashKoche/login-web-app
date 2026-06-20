/* User table */
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(15) NOT NULL,
    password VARCHAR(255) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/* Explicitly set the initial auto_increment offset value safely */
ALTER TABLE users AUTO_INCREMENT = 2;

/* Links Table */
CREATE TABLE IF NOT EXISTS links (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    title VARCHAR(150) NOT NULL,
    url VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_links_users FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

/*User */
CREATE USER IF NOT EXISTS
'crud_user'@'%'
IDENTIFIED BY 'CrudUserPass';

GRANT ALL PRIVILEGES
ON crud_links.*
TO 'crud_user'@'%';

FLUSH PRIVILEGES;

/* Sessions Table for Express Session Store */
CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
    expires INT(11) UNSIGNED NOT NULL,
    data TEXT COLLATE utf8mb4_bin,
    PRIMARY KEY (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
