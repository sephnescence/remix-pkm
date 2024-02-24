FROM node:20-alpine

# Copying these separately prevents re-running npm install on every code change.
COPY package.json /tmp
COPY package-lock.json /tmp

RUN cd /tmp && npm install

# Ensure that your docker-compose has a volumes entry like `.:/app`
# I ran into issues with node modules installed on my host not being the same architecture so I had to run install in the container
WORKDIR /app

RUN cp -a /tmp/node_modules /app/node_modules

COPY prisma/schema.prisma /app/prisma/schema.prisma

RUN npx prisma generate