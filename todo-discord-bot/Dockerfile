ARG BUILD_FROM
FROM ${BUILD_FROM}

# Install bun and required dependencies
RUN apk add --no-cache curl bash unzip libstdc++ libgcc && \
    curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun

WORKDIR /app

# Configure GitHub Packages auth for @jomavicuna scope
ARG GITHUB_TOKEN
COPY package.json bun.lock .npmrc ./
RUN echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc && \
    bun install --frozen-lockfile --production && \
    rm -f .npmrc

# Copy source files
COPY . .

# Copy run script
COPY run.sh /
RUN chmod a+x /run.sh

CMD [ "/run.sh" ]
