#!/usr/bin/sh

docker compose down
# Get a new access token using the refresh token
ACCESS_TOKEN=$(curl -s -X POST https://api.dropboxapi.com/oauth2/token \
  -d grant_type=refresh_token \
  -d refresh_token=$REFRESH_TOKEN \
  -u "$CLIENT_ID:$CLIENT_SECRET" | jq -r '.access_token')

sudo curl -X POST https://content.dropboxapi.com/2/files/download \
    --header "Authorization: Bearer $ACCESS_TOKEN" \
    --header "Dropbox-API-Arg: {\"path\": \"/postgres_backup/postgres_volume_backup.tar.gz\"}" \
    --output /home/dpesmdr/Projects/damaru/damaru-node/db/postgres_volume_backup.tar.gz

mkdir -p /home/dpesmdr/Projects/damaru/damaru-node/db/pgData
sudo tar -xzvf /home/dpesmdr/Projects/damaru/damaru-node/db/postgres_volume_backup.tar.gz -C /home/dpesmdr/Projects/damaru/damaru-node/db/pgData

rm -rf postgres_volume_backup.tar.gz

docker compose up