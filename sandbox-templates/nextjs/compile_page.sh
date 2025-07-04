#!/bin/bash

# This script runs during building the sandbox template
# and makes sure the Next.js app is (1) running and (2) the `/` page is compiled
function ping_server() {
 	counter=0
 	response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
 	while [[ ${response} -ne 200 ]]; do
 	  let counter++
 	  if  (( counter % 20 == 0 )); then
         echo "Waiting for server to start..."
         sleep 0.1
       fi

 	  response=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000")
 	done
 }

# ping_server &
cd /home/user && npx next dev --turbopack --port 3000 --host 0.0.0.0

ping_server &

cd /home/user

# # Instalar dependencias si es necesario
if [ ! -d node_modules ]; then
  echo "Instalando dependencias..."
  npm install
fi

# # Iniciar servidor Next.js
echo "Iniciando servidor Next.js en puerto 3000..."
npx next dev --turbopack --port 3000 --hostname 0.0.0.0 2>&1

