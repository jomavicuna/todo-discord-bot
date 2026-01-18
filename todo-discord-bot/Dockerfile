ARG BUILD_FROM
FROM ${BUILD_FROM}

# Install bun
RUN apk add --no-cache curl bash unzip && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

# Copy and install dependencies
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production

# Copy source files
COPY . .

# Copy run script
COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
