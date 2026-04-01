#!/bin/bash
# Inicia SQL Server en segundo plano
/opt/mssql/bin/sqlservr &
SQL_PID=$!

echo "⏳ Esperando que SQL Server inicie..."
sleep 20

# Reintenta hasta que sqlcmd responda
for i in $(seq 1 30); do
  /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -No -Q "SELECT 1" > /dev/null 2>&1
  if [ $? -eq 0 ]; then
    echo "✅ SQL Server listo. Ejecutando init..."
    break
  fi
  echo "⏳ Intento $i/30 - esperando SA login..."
  sleep 5
done

# Habilita SA y crea la base de datos
/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -No -Q "
  ALTER LOGIN sa ENABLE;
  ALTER LOGIN sa WITH PASSWORD = '$MSSQL_SA_PASSWORD';
  IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'turnos_db')
    CREATE DATABASE turnos_db;
"

echo "✅ Inicialización completada."

# Mantiene SQL Server corriendo
wait $SQL_PID
