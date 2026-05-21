# TERMIRATOR DEPLOYMENT IMAGE
# Cyberdyne Systems Model 101 Container

FROM rust:1.75-slim AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock ./
COPY src ./src
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/termirator /app/termirator
COPY index.html /app/index.html
COPY css /app/css
COPY js /app/js
COPY assets /app/assets

ENV PORT=8000
EXPOSE 8000

ENTRYPOINT ["/app/termirator"]
