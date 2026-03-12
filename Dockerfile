FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL=postgresql://app:app@db:5432/nagaoka_tech_coop?schema=public
ENV DIRECT_DATABASE_URL=postgresql://app:app@db:5432/nagaoka_tech_coop?schema=public

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY scripts ./scripts
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build
RUN mkdir -p public/uploads
RUN chmod +x scripts/docker-entrypoint.sh

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["./scripts/docker-entrypoint.sh"]
