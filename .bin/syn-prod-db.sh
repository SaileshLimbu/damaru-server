#!/usr/bin/sh

docker compose down

sudo curl -X POST https://content.dropboxapi.com/2/files/download \
    --header "Authorization: Bearer $DROPBOX_ACCESS_TOKEN" \
    --header "Dropbox-API-Arg: {\"path\": \"/postgres_backup/postgres_volume_backup.tar.gz\"}" \
    --output /home/dpesmdr/Projects/damaru/damaru-node/db/postgres_volume_backup.tar.gz

mkdir -p /home/dpesmdr/Projects/damaru/damaru-node/db/pgData
sudo tar -xzvf /home/dpesmdr/Projects/damaru/damaru-node/db/postgres_volume_backup.tar.gz -C /home/dpesmdr/Projects/damaru/damaru-node/db/pgData

rm -rf postgres_volume_backup.tar.gz

docker compose up