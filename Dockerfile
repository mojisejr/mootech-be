FROM node:22-alpine
# bumped 19→22: @supabase/supabase-js needs native WebSocket (Node 22 LTS has it; 19 is EOL)
# FROM node:12-alpine

WORKDIR /app

RUN apk update && \
    apk add --update python3 && \
    apk --no-cache --update add build-base cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev


RUN apk add --no-cache curl fontconfig

RUN mkdir -p /usr/share/fonts/ibm-thai && \
    curl -L -o /usr/share/fonts/ibm-thai/IBMPlexSansThai-Regular.ttf https://github.com/IBM/plex/releases/download/v6.3.0/TrueType/IBMPlexSansThai/IBMPlexSansThai-Regular.ttf && \
    fc-cache -f -v


COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm install


COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start:prod"]