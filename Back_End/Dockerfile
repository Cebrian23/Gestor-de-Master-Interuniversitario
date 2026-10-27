FROM denoland/deno:latest

WORKDIR /app

COPY . .

RUN deno install

RUN deno cache main.ts

CMD ["run", "--allow-net", "--allow-env", "--allow-read", "--allow-ffi", "main.ts"]