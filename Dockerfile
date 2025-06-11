FROM node:18-alpine

RUN apk add --no-cache curl python3 make g++

WORKDIR /app

COPY package*.json .
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

# Verificação explícita
RUN ls -la /app/public

EXPOSE 5000

CMD ["npm", "start"]