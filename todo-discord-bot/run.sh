#!/usr/bin/with-contenv bashio

# Read options from Home Assistant
export DISCORD_TOKEN=$(bashio::config 'discord_token')
export SUPABASE_URL=$(bashio::config 'supabase_url')
export SUPABASE_ANON_KEY=$(bashio::config 'supabase_anon_key')

bashio::log.info "Starting Todo Discord Bot..."

cd /app
exec bun run index.ts
