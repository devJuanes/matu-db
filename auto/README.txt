Flujos listos para importar en MatuDB → Automatizaciones → "Importar JSON".

Orden sugerido (importa uno por uno; cada archivo crea un flujo nuevo):
  01-soporte-chat-nuevo-admin.json       — INSERT chat pendiente → email al admin ({adminNotifyEmail})
  02-soporte-chat-aceptado-usuario.json  — UPDATE a active → email al usuario ({user_email})
  03-soporte-chat-cerrado-usuario.json   — UPDATE a closed → email al usuario
  04-soporte-ticket-nuevo-admin.json     — INSERT SupportTicket → email al admin

Tras importar, abre cada flujo, revisa textos y pulsa "Publicar" (Activo) si todo está bien.

Requisitos en el servidor matu-db-api:
  - SMTP_* y MATUDB_ADMIN_NOTIFY_EMAIL en .env
  - Columna user_email en support_live_chats (migración support_live_chats_user_email.sql) para 02 y 03
  - Las apps deben guardar user_email al crear el chat

Placeholders en cuerpos/asuntos: {adminNotifyEmail}, {user_email}, {user_name}, columnas de la fila, etc.
