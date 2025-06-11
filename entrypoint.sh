#!/bin/sh

# Aguarda o PostgreSQL estar pronto
while ! nc -z db 5432; do
  sleep 1
done

# Gera o Prisma Client e aplica migrações
npx prisma generate
npx prisma migrate deploy

# Inicia a aplicação
exec node src/server.js