FROM node:18-alpine

RUN addgroup -g 10001 -S appgroup && \
    adduser -u 10001 -S -G appgroup -H -D appuser

WORKDIR /usr/src/app

COPY --chown=appuser:appgroup package*.json ./

RUN npm install --only=production

COPY --chown=appuser:appgroup . .

EXPOSE 3000

USER appuser

CMD ["node", "src/index.js"]
