#!/bin/sh

# path /home/logisense/dgafr-script.sh

rm -r dga-votechain/
git clone -b main https://github.com/dgaEvoteAdmin/dga-votechain
cp .env dga-votechain/
cd dga-votechain/
npm i && npm run build
pm2 stop all
cd ../
rm -r /usr/dga-evote/* && cp -r /home/logisense/dga-votechain/.output/* /usr/dga-evote/
pm2 start && pm2 logs