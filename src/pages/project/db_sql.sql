-- Database Schema Export (Generated via Supabase REST API)
-- Generated on: 2026-02-23T21:03:41.105Z

-- Setup for required extensions
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

--- Table: AI_Chat_Conversations ---
CREATE TABLE IF NOT EXISTS public."AI_Chat_Conversations" (
  "id" text NOT NULL DEFAULT ('conv_'::text || (gen_random_uuid())::text),
  "userId" text NOT NULL,
  "title" text NOT NULL DEFAULT 'Nueva Conversación',
  "userRole" text NOT NULL,
  "userLicense" text NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "isPinned" boolean NOT NULL DEFAULT false,
  "lastMessageAt" timestamptz,
  "messageCount" integer NOT NULL DEFAULT 0,
  "metadata" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: AI_Chat_Messages ---
CREATE TABLE IF NOT EXISTS public."AI_Chat_Messages" (
  "id" text NOT NULL DEFAULT ('msg_'::text || (gen_random_uuid())::text),
  "conversationId" text NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "hasDataQuery" boolean NOT NULL DEFAULT false,
  "dataQueryResults" text,
  "metadata" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: AI_Escalation ---
CREATE TABLE IF NOT EXISTS public."AI_Escalation" (
  "id" text NOT NULL DEFAULT ('escalation_'::text || (gen_random_uuid())::text),
  "technicianId" text NOT NULL,
  "category" text NOT NULL,
  "priority" text NOT NULL DEFAULT 'Media',
  "title" text NOT NULL,
  "description" text NOT NULL,
  "userMessage" text,
  "aiResponse" text,
  "status" text NOT NULL DEFAULT 'Abierto',
  "taskId" text,
  "metadata" text,
  "assignedTo" text,
  "resolvedAt" timestamptz,
  "resolvedBy" text,
  "resolution" text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

--- Table: AI_Escalation_Dashboard ---
CREATE TABLE IF NOT EXISTS public."AI_Escalation_Dashboard" (
  "id" text,
  "technicianId" text,
  "category" text,
  "priority" text,
  "title" text,
  "description" text,
  "userMessage" text,
  "aiResponse" text,
  "status" text,
  "taskId" text,
  "metadata" text,
  "assignedTo" text,
  "resolvedAt" timestamptz,
  "resolvedBy" text,
  "resolution" text,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  "technician_name" text,
  "technician_email" text,
  "technician_phone" text,
  "assigned_to_name" text
);

--- Table: AI_Support ---
CREATE TABLE IF NOT EXISTS public."AI_Support" (
  "id" text NOT NULL DEFAULT ('support_'::text || (gen_random_uuid())::text),
  "userId" text NOT NULL,
  "category" text NOT NULL,
  "priority" text NOT NULL DEFAULT 'Media',
  "title" text NOT NULL,
  "description" text NOT NULL,
  "userMessage" text,
  "aiResponse" text,
  "status" text NOT NULL DEFAULT 'Abierto',
  "metadata" text,
  "assignedTo" text,
  "resolvedAt" timestamptz,
  "resolvedBy" text,
  "resolution" text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

--- Table: AlertaTechnician ---
CREATE TABLE IF NOT EXISTS public."AlertaTechnician" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "type" text NOT NULL DEFAULT 'info',
  "priority" text NOT NULL DEFAULT 'normal',
  "category" text NOT NULL DEFAULT 'general',
  "isRead" boolean NOT NULL DEFAULT false,
  "isActive" boolean NOT NULL DEFAULT true,
  "isDismissed" boolean NOT NULL DEFAULT false,
  "actionRequired" boolean NOT NULL DEFAULT false,
  "actionUrl" text,
  "actionText" text,
  "metadata" text,
  "technicianId" text,
  "taskId" text,
  "contractorId" text,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL,
  "readAt" text,
  "expiresAt" text
);

--- Table: AppConfig ---
CREATE TABLE IF NOT EXISTS public."AppConfig" (
  "id" text NOT NULL,
  "key" text NOT NULL,
  "value" text NOT NULL
);

--- Table: AuditLog ---
CREATE TABLE IF NOT EXISTS public."AuditLog" (
  "id" text NOT NULL,
  "action" text NOT NULL,
  "tableName" text NOT NULL,
  "recordId" text,
  "oldValues" text,
  "newValues" text,
  "ipAddress" text,
  "userAgent" text,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: AutomationFlow ---
CREATE TABLE IF NOT EXISTS public."AutomationFlow" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "is_active" boolean NOT NULL DEFAULT false,
  "status" text NOT NULL DEFAULT 'draft',
  "nodes" text NOT NULL,
  "connections" text NOT NULL,
  "execution_start_time" timestamptz,
  "execution_count" integer NOT NULL DEFAULT 0,
  "last_executed_at" timestamptz,
  "created_by" uuid,
  "contractor_id" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

--- Table: Campaign ---
CREATE TABLE IF NOT EXISTS public."Campaign" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "title" text NOT NULL,
  "description" text,
  "image_url" text,
  "has_image" boolean DEFAULT false,
  "button_text" text DEFAULT 'Entendido',
  "button_color" text DEFAULT '#1976D2',
  "button_action" text,
  "start_date" timestamptz,
  "end_date" timestamptz,
  "has_duration" boolean DEFAULT false,
  "is_active" boolean DEFAULT true,
  "is_mandatory" boolean DEFAULT false,
  "priority" integer DEFAULT 0,
  "target_all_users" boolean DEFAULT true,
  "target_contractor" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "created_by" text,
  "view_count" integer DEFAULT 0,
  "click_count" integer DEFAULT 0
);

--- Table: CampaignView ---
CREATE TABLE IF NOT EXISTS public."CampaignView" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "campaign_id" text NOT NULL,
  "technician_id" text NOT NULL,
  "viewed_at" timestamptz DEFAULT now(),
  "button_clicked" boolean DEFAULT false,
  "clicked_at" timestamptz,
  "device_info" text,
  "technician_name" text,
  "technician_email" text,
  "is_read" boolean DEFAULT false,
  "read_at" timestamptz,
  "action_taken" text DEFAULT 'viewed'
);

--- Table: Chat ---
CREATE TABLE IF NOT EXISTS public."Chat" (
  "id" text NOT NULL,
  "userName" text NOT NULL,
  "isCompleted" boolean NOT NULL DEFAULT false,
  "isOpen" boolean NOT NULL DEFAULT true,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL,
  "taskId" text NOT NULL,
  "categoryProblem" text,
  "typeProblem" text,
  "userTyping" boolean DEFAULT false,
  "agentTyping" boolean DEFAULT false
);

--- Table: ChatBotMessages ---
CREATE TABLE IF NOT EXISTS public."ChatBotMessages" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

--- Table: City ---
CREATE TABLE IF NOT EXISTS public."City" (
  "id" text NOT NULL DEFAULT concat('c', gen_random_uuid()),
  "name" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: Contractor ---
CREATE TABLE IF NOT EXISTS public."Contractor" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "codeContractors" text NOT NULL,
  "license" text NOT NULL DEFAULT 'Contratista',
  "status" text NOT NULL DEFAULT 'Activo',
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL,
  "description" text,
  "address" text,
  "phone" text,
  "email" text,
  "website" text,
  "isAccess" boolean,
  "tokens" integer,
  "last_token_reset" timestamptz
);

--- Table: CoordinatorChat ---
CREATE TABLE IF NOT EXISTS public."CoordinatorChat" (
  "id" text NOT NULL,
  "contractorId" text,
  "contractorName" text,
  "isGlobalChat" boolean DEFAULT false,
  "lastMessage" text,
  "lastMessageTime" text,
  "lastMessageType" text DEFAULT 'text',
  "unreadCount" integer DEFAULT 0,
  "isActive" boolean DEFAULT true,
  "createdAt" text DEFAULT now(),
  "updatedAt" text DEFAULT now()
);

--- Table: CoordinatorMessage ---
CREATE TABLE IF NOT EXISTS public."CoordinatorMessage" (
  "id" text NOT NULL,
  "chatId" text NOT NULL,
  "senderId" text NOT NULL,
  "senderName" text NOT NULL,
  "senderLicense" text NOT NULL,
  "senderIsContractor" boolean DEFAULT false,
  "senderContractorId" text,
  "messageText" text NOT NULL,
  "messageType" text DEFAULT 'text',
  "imageUrl" text,
  "fileUrl" text,
  "fileName" text,
  "fileSize" integer,
  "isRead" boolean DEFAULT false,
  "readAt" text,
  "metadata" text,
  "messageTime" text DEFAULT now(),
  "status" text DEFAULT 'sent'
);

--- Table: CoordinatorMessageRead ---
CREATE TABLE IF NOT EXISTS public."CoordinatorMessageRead" (
  "id" text NOT NULL,
  "messageId" text NOT NULL,
  "userId" text NOT NULL,
  "readAt" text DEFAULT now()
);

--- Table: DelayReasons ---
CREATE TABLE IF NOT EXISTS public."DelayReasons" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "reason" text NOT NULL,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: DeviceMetrics ---
CREATE TABLE IF NOT EXISTS public."DeviceMetrics" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "technicianId" text,
  "userId" text,
  "deviceId" text NOT NULL,
  "deviceModel" text,
  "deviceBrand" text,
  "androidVersion" text,
  "appVersion" text,
  "appVersionCode" integer,
  "appState" text NOT NULL,
  "sessionId" text,
  "batteryLevel" integer,
  "batteryStatus" text,
  "batteryHealth" text,
  "batteryTemperature" numeric,
  "batteryVoltage" integer,
  "isPowerSaveMode" boolean DEFAULT false,
  "batteryConsumptionPercent" numeric,
  "batteryConsumptionTimeMs" bigint,
  "estimatedBatteryTimeRemaining" bigint,
  "connectionType" text,
  "isConnected" boolean DEFAULT false,
  "networkOperator" text,
  "signalStrength" integer,
  "dataUsageBytes" bigint,
  "dataUsageTimeMs" bigint,
  "cpuUsagePercent" numeric,
  "memoryUsageMB" numeric,
  "memoryTotalMB" numeric,
  "storageUsedMB" numeric,
  "storageTotalMB" numeric,
  "errorCount" integer DEFAULT 0,
  "errorTypes" text,
  "lastError" text,
  "lastErrorTime" timestamptz,
  "logLevel" text,
  "logMessages" text,
  "hasPerformanceIssues" boolean DEFAULT false,
  "performanceIssues" text,
  "hasDelays" boolean DEFAULT false,
  "delayReasons" text,
  "healthStatus" text DEFAULT 'unknown',
  "healthScore" integer,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: DeviceMetricsSummary ---
CREATE TABLE IF NOT EXISTS public."DeviceMetricsSummary" (
  "deviceId" text,
  "technicianId" text,
  "userId" text,
  "lastReport" timestamptz,
  "avgBatteryLevel" numeric,
  "minBatteryLevel" integer,
  "avgCpuUsage" numeric,
  "avgMemoryUsage" numeric,
  "totalDataUsage" numeric,
  "totalErrors" bigint,
  "currentHealthStatus" text,
  "avgHealthScore" numeric,
  "reportCount" bigint
);

--- Table: Employer ---
CREATE TABLE IF NOT EXISTS public."Employer" (
  "id" text NOT NULL,
  "email" text NOT NULL,
  "name" text NOT NULL,
  "role" text NOT NULL DEFAULT 'Empleado',
  "license" text NOT NULL DEFAULT 'Contratista',
  "status" text NOT NULL DEFAULT 'Activo',
  "registeredAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "lastAccess" text NOT NULL,
  "phone" text,
  "location" text,
  "department" text,
  "avatar" text,
  "permissions" jsonb,
  "typeTeams" text,
  "canViewAllOrders" boolean NOT NULL DEFAULT false,
  "userRole" text,
  "isOnline" boolean NOT NULL DEFAULT false,
  "lastSeen" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "photoURL" text,
  "password" text,
  "fcmToken" text,
  "deviceInfo" text,
  "contractorId" text NOT NULL
);

--- Table: Evaluation ---
CREATE TABLE IF NOT EXISTS public."Evaluation" (
  "id" text NOT NULL,
  "orderId" text NOT NULL,
  "taskId" text,
  "rating" integer NOT NULL,
  "puntualidad" integer,
  "calidadServicio" integer NOT NULL,
  "atencion" integer NOT NULL,
  "tipoEvaluacion" text NOT NULL DEFAULT 'satisfaccion',
  "comentarios" text,
  "clienteInfo" text,
  "imagenes" text,
  "orderInfo" text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

--- Table: FAQ ---
CREATE TABLE IF NOT EXISTS public."FAQ" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "question" text NOT NULL,
  "answer" text NOT NULL,
  "category" text NOT NULL,
  "order" integer DEFAULT 0,
  "views" integer DEFAULT 0,
  "helpful" integer DEFAULT 0,
  "notHelpful" integer DEFAULT 0,
  "isActive" boolean DEFAULT true,
  "createdAt" text DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: Group ---
CREATE TABLE IF NOT EXISTS public."Group" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL,
  "members" jsonb,
  "type" text NOT NULL
);

--- Table: GroupCity ---
CREATE TABLE IF NOT EXISTS public."GroupCity" (
  "groupId" text NOT NULL,
  "cityId" text NOT NULL
);

--- Table: Health_Peak ---
CREATE TABLE IF NOT EXISTS public."Health_Peak" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "metric_type" text NOT NULL,
  "value" numeric NOT NULL,
  "details" text,
  "timestamp" timestamptz NOT NULL DEFAULT now(),
  "technician_id" text
);

--- Table: HistoryNetwork ---
CREATE TABLE IF NOT EXISTS public."HistoryNetwork" (
  "id" bigint NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "type_network" text,
  "name_network" text,
  "is_conect" boolean,
  "ip_network" text,
  "datetime" text,
  "id_users" text,
  "id_orden" text,
  "connection_duration_seconds" integer DEFAULT 0,
  "disconnection_duration_seconds" integer DEFAULT 0,
  "last_connection_time" timestamptz,
  "last_disconnection_time" timestamptz,
  "network_strength" integer DEFAULT 0,
  "network_type" text DEFAULT 'unknown',
  "app_version" text DEFAULT '1.0.0',
  "device_model" text,
  "android_version" text,
  "battery_level" integer DEFAULT 0,
  "location_lat" numeric,
  "location_lng" numeric,
  "notes" text
);

--- Table: InvitationToken ---
CREATE TABLE IF NOT EXISTS public."InvitationToken" (
  "id" text NOT NULL,
  "token" text NOT NULL,
  "email" text NOT NULL,
  "createdBy" text NOT NULL,
  "createdAt" timestamptz DEFAULT now(),
  "expiresAt" timestamptz NOT NULL,
  "usedAt" timestamptz,
  "isUsed" boolean DEFAULT false,
  "licenseType" text,
  "metadata" text
);

--- Table: LiveChatMessage ---
CREATE TABLE IF NOT EXISTS public."LiveChatMessage" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "sessionId" uuid NOT NULL,
  "senderType" text NOT NULL,
  "message" text,
  "attachmentUrl" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: LiveChatSession ---
CREATE TABLE IF NOT EXISTS public."LiveChatSession" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userEmail" text NOT NULL,
  "agentId" uuid,
  "status" text NOT NULL DEFAULT 'searching',
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "endedAt" timestamptz
);

--- Table: LoginAttempts ---
CREATE TABLE IF NOT EXISTS public."LoginAttempts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" text,
  "email" text NOT NULL,
  "userName" text,
  "attemptDate" timestamptz DEFAULT now(),
  "ipAddress" text,
  "city" text,
  "region" text,
  "country" text,
  "latitude" numeric,
  "longitude" numeric,
  "timezone" text,
  "isp" text,
  "userAgent" text,
  "deviceType" text,
  "browser" text,
  "browserVersion" text,
  "os" text,
  "osVersion" text,
  "screenResolution" text,
  "screenColorDepth" integer,
  "language" text,
  "platform" text,
  "localStorageData" text,
  "sessionStorageData" text,
  "cookiesData" text,
  "cacheSize" bigint,
  "localStorageSize" bigint,
  "sessionStorageSize" bigint,
  "indexedDBSize" bigint,
  "webSQLSize" bigint,
  "connectionType" text,
  "connectionSpeed" text,
  "onlineStatus" boolean,
  "networkInfo" text,
  "isAccessDenied" boolean DEFAULT true,
  "attemptCount" integer DEFAULT 1,
  "lastAttempt" timestamptz DEFAULT now(),
  "blocked" boolean DEFAULT false,
  "securityFlags" text,
  "riskScore" integer DEFAULT 0,
  "notes" text,
  "adminNotes" text,
  "tags" jsonb,
  "priority" text DEFAULT 'normal',
  "status" text DEFAULT 'pending',
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

--- Table: LoginAttemptsStats ---
CREATE TABLE IF NOT EXISTS public."LoginAttemptsStats" (
  "userId" text,
  "email" text,
  "totalCount" bigint,
  "lastAttemptDate" timestamptz,
  "uniqueIPs" bigint,
  "avgRiskScore" numeric,
  "hasBlocked" boolean
);

--- Table: ManualTemplate ---
CREATE TABLE IF NOT EXISTS public."ManualTemplate" (
  "id" text NOT NULL DEFAULT ('template_'::text || (gen_random_uuid())::text),
  "name" text NOT NULL,
  "description" text,
  "category" text,
  "thumbnail" text,
  "content" text NOT NULL,
  "theme" text,
  "isactive" boolean DEFAULT true,
  "createdat" timestamptz DEFAULT now(),
  "updatedat" timestamptz DEFAULT now()
);

--- Table: Message ---
CREATE TABLE IF NOT EXISTS public."Message" (
  "id" text NOT NULL DEFAULT gen_random_uuid(),
  "messageText" text NOT NULL,
  "messageType" text NOT NULL DEFAULT 'text',
  "senderName" text NOT NULL,
  "messageTime" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "status" text NOT NULL DEFAULT 'sent',
  "senderType" text NOT NULL DEFAULT 'user',
  "metadata" text,
  "chatId" text NOT NULL,
  "isRead" boolean NOT NULL DEFAULT false,
  "senderId" text NOT NULL,
  "reactions" text
);

--- Table: NewYearCelebrationPreference ---
CREATE TABLE IF NOT EXISTS public."NewYearCelebrationPreference" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "userId" text NOT NULL,
  "userType" text NOT NULL,
  "viewedAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: Notification ---
CREATE TABLE IF NOT EXISTS public."Notification" (
  "id" text NOT NULL DEFAULT gen_random_uuid(),
  "type" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "isRead" boolean NOT NULL DEFAULT false,
  "priority" text NOT NULL DEFAULT 'normal',
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "metadata" text,
  "technicianId" text,
  "employerId" text,
  "userId" text,
  "taskId" text,
  "chatId" text
);

--- Table: Notification_Stats ---
CREATE TABLE IF NOT EXISTS public."Notification_Stats" (
  "technicianId" text,
  "total_notifications" bigint,
  "unread_count" bigint,
  "chat_count" bigint,
  "message_count" bigint,
  "new_order_count" bigint,
  "system_count" bigint
);

--- Table: PQR ---
CREATE TABLE IF NOT EXISTS public."PQR" (
  "id" text NOT NULL,
  "orderId" text NOT NULL,
  "taskId" text,
  "tipo" text NOT NULL,
  "asunto" text NOT NULL,
  "descripcion" text NOT NULL,
  "prioridad" text NOT NULL DEFAULT 'media',
  "contacto" text,
  "estado" text NOT NULL DEFAULT 'pendiente',
  "clienteInfo" text,
  "imagenes" text,
  "orderInfo" text,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: PasswordChangeLog ---
CREATE TABLE IF NOT EXISTS public."PasswordChangeLog" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL,
  "changedAt" timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  "userAgent" text,
  "ip" text
);

--- Table: Push_Notification ---
CREATE TABLE IF NOT EXISTS public."Push_Notification" (
  "id" text NOT NULL DEFAULT ('push_'::text || (gen_random_uuid())::text),
  "title" text NOT NULL,
  "message" text NOT NULL,
  "icon" text DEFAULT 'ic_notification',
  "targetType" text NOT NULL,
  "targetUserId" text,
  "targetContractorId" text,
  "priority" text NOT NULL DEFAULT 'normal',
  "actionType" text,
  "actionUrl" text,
  "metadata" text,
  "sentAt" timestamptz,
  "sentBy" text,
  "isSent" boolean DEFAULT false,
  "scheduledFor" timestamptz,
  "expiresAt" timestamptz,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

--- Table: Push_Notification_Read ---
CREATE TABLE IF NOT EXISTS public."Push_Notification_Read" (
  "id" text NOT NULL DEFAULT ('pnr_'::text || (gen_random_uuid())::text),
  "pushNotificationId" text NOT NULL,
  "technicianId" text NOT NULL,
  "readAt" timestamptz DEFAULT now(),
  "deviceInfo" text
);

--- Table: Push_Notification_With_Stats ---
CREATE TABLE IF NOT EXISTS public."Push_Notification_With_Stats" (
  "id" text,
  "title" text,
  "message" text,
  "icon" text,
  "targetType" text,
  "targetUserId" text,
  "targetContractorId" text,
  "priority" text,
  "actionType" text,
  "actionUrl" text,
  "metadata" text,
  "sentAt" timestamptz,
  "sentBy" text,
  "isSent" boolean,
  "scheduledFor" timestamptz,
  "expiresAt" timestamptz,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  "readCount" bigint,
  "targetCount" bigint
);

--- Table: ReassignmentHistory ---
CREATE TABLE IF NOT EXISTS public."ReassignmentHistory" (
  "id" text NOT NULL,
  "taskid" text NOT NULL,
  "orderid" text,
  "fromtechnicianid" text,
  "totechnicianid" text NOT NULL,
  "reason" text,
  "actoruserid" text,
  "previousstatus" text,
  "newstatus" text,
  "createdat" timestamptz DEFAULT now()
);

--- Table: RegionalSettings ---
CREATE TABLE IF NOT EXISTS public."RegionalSettings" (
  "id" text NOT NULL,
  "regionName" text NOT NULL,
  "displayName" text NOT NULL,
  "municipalities" jsonb,
  "isActive" boolean NOT NULL DEFAULT true,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL,
  "contractorId" text NOT NULL
);

--- Table: SMSConfiguration ---
CREATE TABLE IF NOT EXISTS public."SMSConfiguration" (
  "id" text NOT NULL DEFAULT gen_random_uuid(),
  "configKey" text NOT NULL,
  "configValue" boolean NOT NULL DEFAULT true,
  "description" text,
  "createdAt" text DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: SMS_Config ---
CREATE TABLE IF NOT EXISTS public."SMS_Config" (
  "id" text NOT NULL DEFAULT gen_random_uuid(),
  "configKey" text NOT NULL,
  "configValue" text NOT NULL,
  "configType" text NOT NULL DEFAULT 'string',
  "isActive" boolean NOT NULL DEFAULT true,
  "description" text,
  "lastUpdatedBy" text,
  "createdAt" text DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: SMS_TestNumbers ---
CREATE TABLE IF NOT EXISTS public."SMS_TestNumbers" (
  "id" text NOT NULL DEFAULT gen_random_uuid(),
  "phoneNumber" text NOT NULL,
  "contactName" text NOT NULL,
  "description" text,
  "isActive" boolean NOT NULL DEFAULT true,
  "isPrimaryTest" boolean NOT NULL DEFAULT false,
  "createdAt" text DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: ScheduleGantt ---
CREATE TABLE IF NOT EXISTS public."ScheduleGantt" (
  "id" text NOT NULL,
  "userId" text NOT NULL,
  "userName" text,
  "userEmail" text,
  "title" text NOT NULL,
  "description" text,
  "startDate" text NOT NULL,
  "endDate" text NOT NULL,
  "isPublic" boolean NOT NULL DEFAULT false,
  "publicUrl" text,
  "scheduleData" text NOT NULL,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "isDeleted" boolean NOT NULL DEFAULT false
);

--- Table: SearchHistory ---
CREATE TABLE IF NOT EXISTS public."SearchHistory" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "user_name" text NOT NULL,
  "order_id" text NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  "success" boolean DEFAULT false
);

--- Table: SecurityThreats ---
CREATE TABLE IF NOT EXISTS public."SecurityThreats" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" text,
  "userEmail" text,
  "userName" text,
  "isAuthenticated" boolean DEFAULT false,
  "threatType" text NOT NULL,
  "threatCategory" text NOT NULL,
  "threatDescription" text,
  "threatSeverity" text DEFAULT 'medium',
  "threatDate" timestamptz DEFAULT now(),
  "pageUrl" text NOT NULL,
  "pageTitle" text,
  "referrer" text,
  "pathname" text,
  "ipAddress" text,
  "city" text,
  "region" text,
  "country" text,
  "latitude" numeric,
  "longitude" numeric,
  "timezone" text,
  "isp" text,
  "userAgent" text,
  "deviceType" text,
  "browser" text,
  "browserVersion" text,
  "os" text,
  "osVersion" text,
  "screenResolution" text,
  "language" text,
  "platform" text,
  "keyPressed" text,
  "elementTarget" text,
  "elementHTML" text,
  "stackTrace" text,
  "additionalData" text,
  "sessionId" text,
  "sessionDuration" integer,
  "localStorage" text,
  "sessionStorage" text,
  "cookies" text,
  "connectionType" text,
  "onlineStatus" boolean,
  "networkInfo" text,
  "riskScore" integer DEFAULT 0,
  "autoBlocked" boolean DEFAULT false,
  "blocked" boolean DEFAULT false,
  "blockedReason" text,
  "blockedUntil" timestamptz,
  "incidentCount" integer DEFAULT 1,
  "lastIncidentDate" timestamptz DEFAULT now(),
  "actionTaken" text,
  "actionDetails" text,
  "reviewedBy" text,
  "reviewedAt" timestamptz,
  "reviewNotes" text,
  "tags" jsonb,
  "priority" text DEFAULT 'normal',
  "status" text DEFAULT 'pending',
  "resolved" boolean DEFAULT false,
  "resolvedAt" timestamptz,
  "resolvedBy" text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

--- Table: SecurityThreatsStats ---
CREATE TABLE IF NOT EXISTS public."SecurityThreatsStats" (
  "identifier" text,
  "userEmail" text,
  "isAuthenticated" boolean,
  "ipAddress" text,
  "totalThreats" bigint,
  "lastThreatDate" timestamptz,
  "uniqueThreatTypes" bigint,
  "maxRiskScore" integer,
  "totalIncidents" bigint,
  "isBlocked" boolean,
  "isAutoBlocked" boolean
);

--- Table: Sistema ---
CREATE TABLE IF NOT EXISTS public."Sistema" (
  "id" integer NOT NULL,
  "version" text NOT NULL,
  "version_number" integer NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "release_notes" text,
  "mandatory" boolean DEFAULT true,
  "activa" boolean DEFAULT false,
  "es_cliente" boolean DEFAULT false,
  "download_url" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

--- Table: SupportContact ---
CREATE TABLE IF NOT EXISTS public."SupportContact" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "type" text NOT NULL,
  "label" text NOT NULL,
  "value" text NOT NULL,
  "description" text,
  "isActive" boolean DEFAULT true,
  "order" integer DEFAULT 0,
  "availableHours" text,
  "createdAt" text DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: SupportTicket ---
CREATE TABLE IF NOT EXISTS public."SupportTicket" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ticketNumber" text NOT NULL,
  "technicianId" text,
  "userName" text NOT NULL,
  "userEmail" text NOT NULL,
  "userPhone" text NOT NULL,
  "subject" text NOT NULL,
  "message" text NOT NULL,
  "priority" text DEFAULT 'normal',
  "status" text DEFAULT 'pending',
  "category" text DEFAULT 'other',
  "attachmentUrl" text,
  "deviceInfo" text,
  "appVersion" text,
  "osVersion" text,
  "assignedTo" text,
  "resolvedAt" text,
  "resolvedBy" text,
  "resolution" text,
  "rating" integer,
  "feedback" text,
  "createdAt" text DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: SupportTicketMessage ---
CREATE TABLE IF NOT EXISTS public."SupportTicketMessage" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ticketId" uuid NOT NULL,
  "senderId" uuid NOT NULL,
  "senderType" text NOT NULL,
  "message" text NOT NULL,
  "attachmentUrl" text,
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: SystemMetrics ---
CREATE TABLE IF NOT EXISTS public."SystemMetrics" (
  "id" text NOT NULL,
  "date" text NOT NULL,
  "metric" text NOT NULL,
  "value" numeric NOT NULL,
  "metadata" text,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: System_Notification ---
CREATE TABLE IF NOT EXISTS public."System_Notification" (
  "id" text NOT NULL DEFAULT ('notif_'::text || (gen_random_uuid())::text),
  "technicianId" text NOT NULL,
  "type" text NOT NULL,
  "title" text NOT NULL,
  "message" text NOT NULL,
  "icon" text,
  "priority" text NOT NULL DEFAULT 'normal',
  "isRead" boolean DEFAULT false,
  "isArchived" boolean DEFAULT false,
  "relatedId" text,
  "relatedType" text,
  "actionUrl" text,
  "metadata" text,
  "expiresAt" timestamptz,
  "createdAt" timestamptz DEFAULT now(),
  "readAt" timestamptz,
  "archivedAt" timestamptz
);

--- Table: Task ---
CREATE TABLE IF NOT EXISTS public."Task" (
  "id" text NOT NULL,
  "trackingId" text NOT NULL,
  "orderId" text,
  "date" text,
  "clientName" text NOT NULL,
  "clientPhone" text,
  "clientId" text,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "neighborhood" text,
  "status" text NOT NULL DEFAULT 'Asignada',
  "priority" text NOT NULL DEFAULT 'medium',
  "estimatedTime" integer NOT NULL DEFAULT 2,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL,
  "technicianId" text,
  "technicianName" text,
  "appointmentStart" text,
  "appointmentEnd" text,
  "appointmentStatus" text,
  "rescheduleId" text,
  "originalTrackingId" text,
  "rescheduleReason" text,
  "previousTechnicianId" text,
  "previousTechnicianName" text,
  "rescheduledAt" text,
  "completed" boolean NOT NULL DEFAULT false,
  "dueDate" text,
  "description" text,
  "service" text,
  "internetPlan" text,
  "puerto" text,
  "serialCelsia" text,
  "notes" text,
  "assignedAt" text,
  "assignee" text,
  "contractorId" text NOT NULL,
  "correo_electronico" text,
  "problem_category" text,
  "problem_type" text,
  "agenteContactoExitoso" boolean,
  "agenteEscalamiento" text,
  "agenteAccionFinal" text,
  "agenteMotivoCancelacion" text,
  "agenteMotivoReagendar" text,
  "agenteObservaciones" text,
  "agenteGestionada" boolean NOT NULL DEFAULT false,
  "agenteGestionadaAt" text,
  "agenteContactoExitosoAt" timestamptz,
  "agenteSinContactoAt" timestamptz,
  "agenteAccionSeleccionada" text,
  "agenteAccionSeleccionadaAt" timestamptz,
  "agenteMotivoCancelacionAt" timestamptz,
  "agenteMotivoReagendarAt" timestamptz,
  "agenteUsuario" text,
  "agenteUsuarioEmail" text,
  "agenteEscaladoAt" text,
  "agenteEscaladoTiempoLimite" text,
  "agenteEscaladoAlerta" boolean DEFAULT false,
  "agenteEscaladoReagendarDisponible" boolean DEFAULT false,
  "agenteEscaladoCompletado" boolean DEFAULT false,
  "isProblem" boolean,
  "isGestionado" boolean,
  "is_asignada" boolean,
  "novedadCarta" text,
  "fecha_inicio_cita" timestamptz,
  "fecha_fin_cita" timestamptz,
  "acciones_ejecutadas" text,
  "escaladoSinContacto" boolean DEFAULT false,
  "escaladoSinContactoAt" timestamptz,
  "temporizadorInicio" timestamptz,
  "temporizadorExpiracion" timestamptz,
  "temporizadorActivo" boolean DEFAULT false,
  "temporizadorExpirado" boolean DEFAULT false,
  "agenteTiempoInicio" timestamptz,
  "agenteTiempoLimite" timestamptz,
  "agenteTiempoFinalizado" timestamptz,
  "agenteTiempoExcedido" boolean DEFAULT false,
  "agenteTiempoTotalSegundos" integer,
  "reagendarIdsLlamadas" text,
  "reagendarFechaLimite" timestamptz,
  "reagendarFechaInicio" timestamptz,
  "motivoAtrasoTecnico" text,
  "motivoAtrasoTecnicoAt" timestamptz,
  "motivoAtrasoGestor" text,
  "motivoAtrasoGestorAt" timestamptz,
  "gestorUsuario" text,
  "gestorUsuarioEmail" text,
  "esAtrasoValidado" boolean DEFAULT false,
  "esIncumplimiento" boolean DEFAULT false,
  "atrasoGestionado" boolean DEFAULT false,
  "motivoAtrasoId" uuid
);

--- Table: TaskAgentAction ---
CREATE TABLE IF NOT EXISTS public."TaskAgentAction" (
  "id" text NOT NULL,
  "taskTrackingId" text NOT NULL,
  "step" text,
  "actionKey" text,
  "actionLabel" text,
  "actionType" text,
  "value" text,
  "successful" boolean,
  "metadata" text,
  "actorName" text,
  "actorEmail" text,
  "actionAt" timestamptz NOT NULL DEFAULT now(),
  "createdAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: TaskV2 ---
CREATE TABLE IF NOT EXISTS public."TaskV2" (
  "id" text NOT NULL,
  "trackingId" text NOT NULL,
  "orderId" text,
  "date" text,
  "clientName" text NOT NULL,
  "clientPhone" text,
  "clientId" text,
  "address" text NOT NULL,
  "city" text NOT NULL,
  "neighborhood" text,
  "status" text NOT NULL DEFAULT 'Asignada',
  "priority" text NOT NULL DEFAULT 'medium',
  "estimatedTime" integer NOT NULL DEFAULT 2,
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL,
  "technicianId" text,
  "technicianName" text,
  "appointmentStart" text,
  "appointmentEnd" text,
  "appointmentStatus" text,
  "rescheduleId" text,
  "originalTrackingId" text,
  "rescheduleReason" text,
  "previousTechnicianId" text,
  "previousTechnicianName" text,
  "rescheduledAt" text,
  "completed" boolean NOT NULL DEFAULT false,
  "dueDate" text,
  "description" text,
  "service" text,
  "internetPlan" text,
  "puerto" text,
  "serialCelsia" text,
  "notes" text,
  "assignedAt" text,
  "assignee" text,
  "contractorId" text NOT NULL,
  "correo_electronico" text,
  "problem_category" text,
  "problem_type" text,
  "agenteContactoExitoso" boolean,
  "agenteEscalamiento" text,
  "agenteAccionFinal" text,
  "agenteMotivoCancelacion" text,
  "agenteMotivoReagendar" text,
  "agenteObservaciones" text,
  "agenteGestionada" boolean NOT NULL DEFAULT false,
  "agenteGestionadaAt" text,
  "agenteContactoExitosoAt" timestamptz,
  "agenteSinContactoAt" timestamptz,
  "agenteAccionSeleccionada" text,
  "agenteAccionSeleccionadaAt" timestamptz,
  "agenteMotivoCancelacionAt" timestamptz,
  "agenteMotivoReagendarAt" timestamptz,
  "agenteUsuario" text,
  "agenteUsuarioEmail" text,
  "agenteEscaladoAt" text,
  "agenteEscaladoTiempoLimite" text,
  "agenteEscaladoAlerta" boolean DEFAULT false,
  "agenteEscaladoReagendarDisponible" boolean DEFAULT false,
  "agenteEscaladoCompletado" boolean DEFAULT false,
  "isProblem" boolean,
  "isGestionado" boolean,
  "is_asignada" boolean,
  "novedadCarta" text,
  "fecha_inicio_cita" timestamptz,
  "fecha_fin_cita" timestamptz,
  "acciones_ejecutadas" text,
  "escaladoSinContacto" boolean DEFAULT false,
  "escaladoSinContactoAt" timestamptz,
  "temporizadorInicio" timestamptz,
  "temporizadorExpiracion" timestamptz,
  "temporizadorActivo" boolean DEFAULT false,
  "temporizadorExpirado" boolean DEFAULT false,
  "agenteTiempoInicio" timestamptz,
  "agenteTiempoLimite" timestamptz,
  "agenteTiempoFinalizado" timestamptz,
  "agenteTiempoExcedido" boolean DEFAULT false,
  "agenteTiempoTotalSegundos" integer,
  "reagendarIdsLlamadas" text,
  "reagendarFechaLimite" timestamptz,
  "reagendarFechaInicio" timestamptz
);

--- Table: Technician ---
CREATE TABLE IF NOT EXISTS public."Technician" (
  "id" text NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "isActive" boolean NOT NULL DEFAULT true,
  "isOnline" boolean NOT NULL DEFAULT false,
  "lastSeen" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "photoURL" text,
  "userRole" text NOT NULL DEFAULT 'Tecnico',
  "password" text,
  "status" text NOT NULL DEFAULT 'Activo',
  "registeredAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "fcmToken" text,
  "deviceInfo" text,
  "metrics" text,
  "contractorId" text NOT NULL,
  "ai_tokens" integer,
  "biometric_enabled" boolean DEFAULT false,
  "biometric_hash" text,
  "biometric_registered_at" timestamptz,
  "biometric_last_used" timestamptz,
  "isAccess" boolean,
  "mode" text,
  "tutorial_completed" boolean NOT NULL DEFAULT false
);

--- Table: TechnicianAction ---
CREATE TABLE IF NOT EXISTS public."TechnicianAction" (
  "id" text NOT NULL,
  "actionType" text NOT NULL,
  "description" text,
  "timestamp" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "location" text,
  "coordinates" text,
  "metadata" text,
  "taskId" text NOT NULL,
  "technicianId" text
);

--- Table: TechnicianHistory ---
CREATE TABLE IF NOT EXISTS public."TechnicianHistory" (
  "id" text NOT NULL,
  "action" text NOT NULL,
  "timestamp" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "metadata" text,
  "technicianId" text NOT NULL,
  "taskId" text NOT NULL
);

--- Table: Ticket ---
CREATE TABLE IF NOT EXISTS public."Ticket" (
  "id" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "type" text NOT NULL,
  "priority" text NOT NULL DEFAULT 'Media',
  "status" text NOT NULL DEFAULT 'Abierto',
  "createdAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "updatedAt" text NOT NULL,
  "resolvedAt" text,
  "resolution" text,
  "tags" jsonb,
  "contractorId" text NOT NULL
);

--- Table: TicketResponse ---
CREATE TABLE IF NOT EXISTS public."TicketResponse" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "ticketId" uuid NOT NULL,
  "userId" text,
  "userName" text NOT NULL,
  "userType" text NOT NULL,
  "message" text NOT NULL,
  "attachmentUrl" text,
  "isInternal" boolean DEFAULT false,
  "createdAt" text DEFAULT 'CURRENT_TIMESTAMP'
);

--- Table: Tutorial ---
CREATE TABLE IF NOT EXISTS public."Tutorial" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "content" text,
  "videoUrl" text,
  "thumbnailUrl" text,
  "duration" text,
  "category" text NOT NULL DEFAULT 'basics',
  "views" integer NOT NULL DEFAULT 0,
  "isPublished" boolean NOT NULL DEFAULT true,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

--- Table: TutorialCompletion ---
CREATE TABLE IF NOT EXISTS public."TutorialCompletion" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "userId" text NOT NULL,
  "userType" text NOT NULL,
  "completedAt" timestamptz NOT NULL DEFAULT now(),
  "skipped" boolean NOT NULL DEFAULT false
);

--- Table: TwilioSMSHistory ---
CREATE TABLE IF NOT EXISTS public."TwilioSMSHistory" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "messageSid" text NOT NULL,
  "toPhone" text NOT NULL,
  "fromPhone" text NOT NULL,
  "messageBody" text NOT NULL,
  "status" text NOT NULL DEFAULT 'queued',
  "errorCode" text,
  "errorMessage" text,
  "price" text,
  "priceUnit" text,
  "numSegments" integer,
  "direction" text DEFAULT 'outbound-api',
  "apiVersion" text,
  "sentBy" text NOT NULL,
  "sentByEmail" text,
  "sentAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "deliveredAt" text,
  "failedAt" text,
  "updatedAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "metadata" text
);

--- Table: TwilioSMSHistory_Recent ---
CREATE TABLE IF NOT EXISTS public."TwilioSMSHistory_Recent" (
  "id" text,
  "messageSid" text,
  "toPhone" text,
  "fromPhone" text,
  "messagePreview" text,
  "messageLength" integer,
  "status" text,
  "errorCode" text,
  "price" text,
  "priceUnit" text,
  "sentBy" text,
  "sentByEmail" text,
  "sentAt" text,
  "deliveredAt" text,
  "failedAt" text
);

--- Table: TwoFactorCodes ---
CREATE TABLE IF NOT EXISTS public."TwoFactorCodes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "userId" text NOT NULL,
  "code" text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "used" boolean DEFAULT false,
  "createdAt" timestamptz DEFAULT now()
);

--- Table: Unread_Notifications ---
CREATE TABLE IF NOT EXISTS public."Unread_Notifications" (
  "id" text,
  "technicianId" text,
  "type" text,
  "title" text,
  "message" text,
  "icon" text,
  "priority" text,
  "isRead" boolean,
  "isArchived" boolean,
  "relatedId" text,
  "relatedType" text,
  "actionUrl" text,
  "metadata" text,
  "expiresAt" timestamptz,
  "createdAt" timestamptz,
  "readAt" timestamptz,
  "archivedAt" timestamptz,
  "technician_name" text
);

--- Table: User ---
CREATE TABLE IF NOT EXISTS public."User" (
  "id" text NOT NULL,
  "email" text NOT NULL,
  "name" text NOT NULL,
  "role" text NOT NULL DEFAULT 'user',
  "license" text NOT NULL,
  "status" text NOT NULL DEFAULT 'Activo',
  "registeredAt" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "lastAccess" text NOT NULL,
  "phone" text,
  "location" text,
  "department" text,
  "avatar" text,
  "permissions" jsonb,
  "typeTeams" text,
  "canViewAllOrders" boolean NOT NULL DEFAULT false,
  "userRole" text,
  "isOnline" boolean NOT NULL DEFAULT false,
  "lastSeen" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "photoURL" text,
  "password" text,
  "fcmToken" text,
  "deviceInfo" text,
  "twoFactorEnabled" boolean DEFAULT false,
  "twoFactorSecret" text,
  "twoFactorBackupCodes" jsonb,
  "maxSessions" integer DEFAULT 3,
  "sessionTimeout" integer DEFAULT 30,
  "requireMFA" boolean DEFAULT false,
  "lastPasswordChange" text,
  "failedLoginAttempts" integer DEFAULT 0,
  "lockedUntil" text,
  "type_network" text,
  "is_conect" boolean,
  "name_network" text,
  "isAccess" boolean,
  "tokens" integer,
  "last_token_reset" timestamptz
);

--- Table: UserGroup ---
CREATE TABLE IF NOT EXISTS public."UserGroup" (
  "userId" text NOT NULL,
  "groupId" text NOT NULL
);

--- Table: UserMood ---
CREATE TABLE IF NOT EXISTS public."UserMood" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "userId" uuid NOT NULL,
  "mood" text NOT NULL,
  "note" text,
  "createdAt" timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

--- Table: VisualManual ---
CREATE TABLE IF NOT EXISTS public."VisualManual" (
  "id" text NOT NULL DEFAULT ('manual_'::text || (gen_random_uuid())::text),
  "title" text NOT NULL,
  "content" text NOT NULL,
  "metadata" text,
  "category" text DEFAULT 'general',
  "tags" jsonb,
  "version" text DEFAULT '1.0',
  "ispublished" boolean DEFAULT false,
  "authorid" text,
  "authorname" text,
  "lasteditedby" text,
  "createdat" timestamptz DEFAULT now(),
  "updatedat" timestamptz DEFAULT now(),
  "viewcount" integer DEFAULT 0,
  "theme" text,
  "dynamicfields" text,
  "templateid" text,
  "templatename" text,
  "thumbnailurl" text,
  "isdraft" boolean DEFAULT true,
  "savedat" timestamptz DEFAULT now()
);

--- Table: active_sessions_view ---
CREATE TABLE IF NOT EXISTS public."active_sessions_view" (
  "id" uuid,
  "user_id" uuid,
  "email" text,
  "user_name" text,
  "ip_address" text,
  "device_info" text,
  "last_activity" timestamptz,
  "expires_at" timestamptz,
  "created_at" timestamptz,
  "minutes_remaining" numeric
);

--- Table: active_shared_metrics_links ---
CREATE TABLE IF NOT EXISTS public."active_shared_metrics_links" (
  "id" uuid,
  "token" text,
  "title" text,
  "description" text,
  "is_public" boolean,
  "allow_filters" boolean,
  "max_views" integer,
  "current_views" integer,
  "expires_at" timestamptz,
  "is_active" boolean,
  "created_by" text,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "metrics_date" text,
  "contractor_filter" text,
  "auto_expire" boolean,
  "expire_after_hours" integer,
  "require_approval" boolean,
  "max_emails_allowed" integer,
  "authorized_emails_count" bigint,
  "status" text
);

--- Table: adicionales_requests ---
CREATE TABLE IF NOT EXISTS public."adicionales_requests" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "contractor_id" text,
  "user_name" text NOT NULL,
  "user_license" text,
  "request_content" text NOT NULL,
  "ai_response" text,
  "conversation_id" text,
  "status" text NOT NULL DEFAULT 'pendiente',
  "assigned_to" uuid,
  "priority" text DEFAULT 'normal',
  "work_type" text,
  "estimated_cost" numeric,
  "materials_needed" jsonb,
  "order_id" uuid,
  "metadata" text,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  "received_at" timestamptz,
  "managed_at" timestamptz,
  "completed_at" timestamptz,
  "notes" text,
  "response_count" integer DEFAULT 0
);

--- Table: adicionales_requests_stats ---
CREATE TABLE IF NOT EXISTS public."adicionales_requests_stats" (
  "date" text,
  "status" text,
  "priority" text,
  "count" bigint,
  "unique_users" bigint,
  "avg_cost" numeric,
  "total_cost" numeric
);

--- Table: agenda ---
CREATE TABLE IF NOT EXISTS public."agenda" (
  "id" text NOT NULL,
  "id_orden" integer,
  "id_cuenta" text,
  "id_oportunidad" text,
  "id_reserva" integer,
  "fecha_inicio_cita" text,
  "fecha_fin_cita" text,
  "fecha" text,
  "estado_cita" text,
  "servicio" text,
  "contratista" text,
  "contratista_f" text,
  "ciudad" text,
  "barrio" text,
  "grupo_de_trabajo" text,
  "direccion" text,
  "telefono_movil" text,
  "otro_telefono" text,
  "correo_electronico" text,
  "nombre_cliente" text,
  "identificacion_cliente" text,
  "plan_de_internet" text,
  "puerto" text,
  "serial_celsia" text,
  "fecha_procesamiento" text NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
  "fecha_reporte" text,
  "fecha_asignacion_contratista" timestamptz,
  "contratista_dirigido" text,
  "fecha_reagendamiento" timestamptz,
  "isAdiccional" boolean,
  "uploaded_by_user_id" text,
  "uploaded_by_user_name" text,
  "uploaded_by_user_email" text,
  "is_asignada_contratista" boolean DEFAULT false,
  "reagendar_ids_llamadas" text,
  "reagendar_fecha_inicio" timestamptz,
  "motivo_cambio_estado" text
);

--- Table: announcement_clicks ---
CREATE TABLE IF NOT EXISTS public."announcement_clicks" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "announcement_id" text NOT NULL,
  "user_id" text NOT NULL,
  "has_viewed" boolean DEFAULT true,
  "has_clicked_button" boolean DEFAULT false,
  "device_type" text DEFAULT 'web',
  "user_agent" text,
  "ip_address" text,
  "viewed_at" timestamptz DEFAULT now(),
  "clicked_at" timestamptz,
  "has_dismissed" boolean DEFAULT false,
  "dismissed_at" timestamptz
);

--- Table: announcements ---
CREATE TABLE IF NOT EXISTS public."announcements" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "title" text NOT NULL,
  "description" text NOT NULL,
  "has_image" boolean DEFAULT false,
  "image_url" text,
  "has_button" boolean DEFAULT false,
  "button_text" text,
  "button_link" text,
  "has_deadline" boolean DEFAULT false,
  "start_date" timestamptz DEFAULT now(),
  "end_date" timestamptz,
  "is_active" boolean DEFAULT true,
  "priority" integer DEFAULT 0,
  "created_by" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "expires_at" timestamptz,
  "view_count" integer DEFAULT 0,
  "click_count" integer DEFAULT 0
);

--- Table: app_config ---
CREATE TABLE IF NOT EXISTS public."app_config" (
  "key" text NOT NULL,
  "value" text NOT NULL,
  "description" text,
  "created_at" timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  "updated_at" timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

--- Table: destinatarios_correo ---
CREATE TABLE IF NOT EXISTS public."destinatarios_correo" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "nombre" text NOT NULL,
  "email" text NOT NULL,
  "tipo" text NOT NULL DEFAULT 'interno',
  "departamento" text,
  "cargo" text,
  "telefono" text,
  "activo" boolean DEFAULT true,
  "fecha_creacion" timestamptz DEFAULT now(),
  "fecha_actualizacion" timestamptz DEFAULT now(),
  "creado_por" text,
  "notas" text
);

--- Table: evaluation_images_view ---
CREATE TABLE IF NOT EXISTS public."evaluation_images_view" (
  "image_path" text,
  "bucket_id" text,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "evaluation_id" text,
  "orderId" text,
  "evaluation_created_at" timestamptz
);

--- Table: evaluation_stats ---
CREATE TABLE IF NOT EXISTS public."evaluation_stats" (
  "total_evaluaciones" bigint,
  "promedio_rating" numeric,
  "promedio_puntualidad" numeric,
  "promedio_calidad" numeric,
  "promedio_atencion" numeric,
  "satisfacciones" bigint,
  "quejas" bigint,
  "sugerencias" bigint,
  "reclamos" bigint,
  "mes" timestamptz
);

--- Table: evaluation_storage_stats ---
CREATE TABLE IF NOT EXISTS public."evaluation_storage_stats" (
  "total_images" bigint,
  "oldest_image" timestamptz,
  "newest_image" timestamptz
);

--- Table: historial_backlog_pendientes ---
CREATE TABLE IF NOT EXISTS public."historial_backlog_pendientes" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "agenda_id" text NOT NULL,
  "id_orden" integer,
  "id_reserva" integer,
  "nombre_cliente" text,
  "identificacion_cliente" text,
  "telefono_movil" text,
  "direccion" text,
  "ciudad" text,
  "estado_anterior" text,
  "estado_nuevo" text NOT NULL,
  "motivo_cambio" text NOT NULL,
  "ids_llamadas_registrados" text,
  "dias_habiles_transcurridos" integer,
  "fecha_gestion" timestamptz NOT NULL DEFAULT now(),
  "usuario_id" text,
  "usuario_nombre" text,
  "usuario_email" text,
  "fecha_orden" text,
  "fecha_procesamiento" timestamptz,
  "fecha_reagendamiento" timestamptz
);

--- Table: historial_reasignacion_aliados ---
CREATE TABLE IF NOT EXISTS public."historial_reasignacion_aliados" (
  "id" text NOT NULL DEFAULT (gen_random_uuid()),
  "agenda_id" text NOT NULL,
  "id_orden" integer,
  "id_reserva" integer,
  "nombre_cliente" text,
  "contratista_anterior" text,
  "contratista_f_anterior" text,
  "contratista_nuevo" text,
  "contratista_f_nuevo" text NOT NULL,
  "motivo_cambio" text NOT NULL,
  "fecha_gestion" timestamptz NOT NULL DEFAULT now(),
  "usuario_id" text,
  "usuario_nombre" text,
  "usuario_email" text
);

--- Table: login_attempts ---
CREATE TABLE IF NOT EXISTS public."login_attempts" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "email" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "success" boolean NOT NULL,
  "reason" text,
  "created_at" timestamptz DEFAULT now()
);

--- Table: naps ---
CREATE TABLE IF NOT EXISTS public."naps" (
  "id" text NOT NULL DEFAULT (gen_random_uuid())::text,
  "id_orden" text NOT NULL,
  "puerto_actual" text,
  "puerto_nuevo" text,
  "serial_celsia_actual" text,
  "serial_celsia_nuevo" text,
  "puerto_update" text,
  "serial_celsia_update" text,
  "descripcion" text NOT NULL,
  "evidencia_url" text,
  "usuario" text NOT NULL,
  "estado" text DEFAULT 'Completado',
  "fecha_creacion" timestamptz DEFAULT now(),
  "fecha_actualizacion" timestamptz DEFAULT now()
);

--- Table: recent_evaluations ---
CREATE TABLE IF NOT EXISTS public."recent_evaluations" (
  "id" text,
  "orderId" text,
  "taskId" text,
  "rating" integer,
  "puntualidad" integer,
  "calidadServicio" integer,
  "atencion" integer,
  "tipoEvaluacion" text,
  "comentarios" text,
  "clienteInfo" text,
  "imagenes" text,
  "orderInfo" text,
  "createdAt" timestamptz,
  "updatedAt" timestamptz,
  "cliente_nombre" text,
  "servicio" text,
  "direccion" text,
  "tecnico_nombre" text
);

--- Table: security_logs ---
CREATE TABLE IF NOT EXISTS public."security_logs" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id" uuid,
  "action" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "metadata" text,
  "created_at" timestamptz DEFAULT now()
);

--- Table: security_stats_view ---
CREATE TABLE IF NOT EXISTS public."security_stats_view" (
  "date" text,
  "action" text,
  "count" bigint,
  "unique_users" bigint,
  "unique_ips" bigint
);

--- Table: settings_soft ---
CREATE TABLE IF NOT EXISTS public."settings_soft" (
  "id" integer NOT NULL,
  "is_maintenance" boolean DEFAULT false,
  "is_app_disabled" boolean DEFAULT false,
  "allow_user_registration" boolean DEFAULT true,
  "allow_login" boolean DEFAULT true,
  "show_ads" boolean DEFAULT true,
  "enable_notifications" boolean DEFAULT true,
  "enable_vip_mode" boolean DEFAULT false,
  "enable_payments" boolean DEFAULT true,
  "show_update_popup" boolean DEFAULT false,
  "force_update" boolean DEFAULT false,
  "enable_dark_mode" boolean DEFAULT true,
  "last_updated" text DEFAULT now(),
  "updated_by" text DEFAULT 'system'
);

--- Table: shared_metrics_access_log ---
CREATE TABLE IF NOT EXISTS public."shared_metrics_access_log" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "link_id" uuid,
  "email" text,
  "ip_address" text,
  "user_agent" text,
  "accessed_at" timestamptz DEFAULT now(),
  "access_result" text DEFAULT 'success',
  "metadata" text
);

--- Table: shared_metrics_authorized_emails ---
CREATE TABLE IF NOT EXISTS public."shared_metrics_authorized_emails" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "link_id" uuid,
  "email" text NOT NULL,
  "is_approved" boolean DEFAULT true,
  "approved_at" timestamptz DEFAULT now(),
  "approved_by" text,
  "created_at" timestamptz DEFAULT now()
);

--- Table: shared_metrics_links ---
CREATE TABLE IF NOT EXISTS public."shared_metrics_links" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "token" text NOT NULL,
  "title" text,
  "description" text,
  "is_public" boolean DEFAULT true,
  "allow_filters" boolean DEFAULT true,
  "max_views" integer DEFAULT 100,
  "current_views" integer DEFAULT 0,
  "expires_at" timestamptz,
  "is_active" boolean DEFAULT true,
  "created_by" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "metrics_date" text,
  "contractor_filter" text,
  "auto_expire" boolean DEFAULT false,
  "expire_after_hours" integer DEFAULT 24,
  "require_approval" boolean DEFAULT false,
  "max_emails_allowed" integer DEFAULT 10
);

--- Table: sistema ---
CREATE TABLE IF NOT EXISTS public."sistema" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "version" text NOT NULL,
  "version_number" numeric NOT NULL,
  "descripcion" text,
  "cambios" jsonb,
  "fecha_lanzamiento" timestamptz DEFAULT now(),
  "activa" boolean DEFAULT false,
  "obligatoria" boolean DEFAULT false,
  "url_descarga" text,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

--- Table: support_live_chats ---
CREATE TABLE IF NOT EXISTS public."support_live_chats" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "user_name" text,
  "agent_id" uuid,
  "status" text DEFAULT 'pending',
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "closed_at" timestamptz
);

--- Table: support_live_messages ---
CREATE TABLE IF NOT EXISTS public."support_live_messages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "chat_id" uuid,
  "sender_id" uuid NOT NULL,
  "content" text,
  "file_url" text,
  "file_type" text,
  "created_at" timestamptz DEFAULT now(),
  "is_read" boolean DEFAULT false,
  "reaction" text
);

--- Table: system_config ---
CREATE TABLE IF NOT EXISTS public."system_config" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "key" text NOT NULL,
  "value" text NOT NULL,
  "description" text,
  "updated_at" timestamptz DEFAULT now()
);

--- Table: tickets_support ---
CREATE TABLE IF NOT EXISTS public."tickets_support" (
  "id" integer NOT NULL,
  "user_id" uuid NOT NULL,
  "asunto" text NOT NULL,
  "descripcion" text NOT NULL,
  "estado" text NOT NULL DEFAULT 'Enviado',
  "imagen_url" text,
  "fecha_creacion" text NOT NULL DEFAULT now(),
  "fecha_actualizacion" text NOT NULL DEFAULT now(),
  "trazabilidad" text,
  "comentarios" text
);

--- Table: tickets_support_comentarios ---
CREATE TABLE IF NOT EXISTS public."tickets_support_comentarios" (
  "id" integer NOT NULL,
  "ticket_id" integer,
  "autor" text NOT NULL,
  "texto" text NOT NULL,
  "fecha" text NOT NULL DEFAULT now(),
  "user_id" uuid,
  "likes" integer NOT NULL DEFAULT 0,
  "dislikes" integer NOT NULL DEFAULT 0,
  "user_feedback" text
);

--- Table: tickets_support_trazabilidad ---
CREATE TABLE IF NOT EXISTS public."tickets_support_trazabilidad" (
  "id" integer NOT NULL,
  "ticket_id" integer,
  "estado" text NOT NULL,
  "comentario" text,
  "fecha" text NOT NULL DEFAULT now()
);

--- Table: tutorial ---
CREATE TABLE IF NOT EXISTS public."tutorial" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "description" text,
  "content" text,
  "videourl" text,
  "thumbnailurl" text,
  "duration" text,
  "category" text NOT NULL DEFAULT 'basics',
  "views" integer NOT NULL DEFAULT 0,
  "ispublished" boolean NOT NULL DEFAULT true,
  "createdat" timestamptz NOT NULL DEFAULT now(),
  "updatedat" timestamptz NOT NULL DEFAULT now()
);

--- Table: user_sessions ---
CREATE TABLE IF NOT EXISTS public."user_sessions" (
  "id" uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  "user_id" uuid NOT NULL,
  "session_token" text NOT NULL,
  "refresh_token" text NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "device_info" text,
  "is_active" boolean DEFAULT true,
  "last_activity" timestamptz DEFAULT now(),
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

--- Table: user_tutorial_progress ---
CREATE TABLE IF NOT EXISTS public."user_tutorial_progress" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL,
  "tutorial_id" uuid NOT NULL,
  "completed_at" timestamptz NOT NULL DEFAULT now()
);

--- Table: v_connection_stats ---
CREATE TABLE IF NOT EXISTS public."v_connection_stats" (
  "id_orden" text,
  "id_users" text,
  "total_records" bigint,
  "connection_count" bigint,
  "disconnection_count" bigint,
  "first_record" timestamptz,
  "last_record" timestamptz,
  "current_disconnection_duration_seconds" integer,
  "last_connection_time" timestamptz,
  "last_disconnection_time" timestamptz
);

--- Table: v_sms_config_active ---
CREATE TABLE IF NOT EXISTS public."v_sms_config_active" (
  "configKey" text,
  "configValue" text,
  "configType" text,
  "description" text,
  "isActive" boolean,
  "updatedAt" text
);

--- Table: v_sms_test_numbers_active ---
CREATE TABLE IF NOT EXISTS public."v_sms_test_numbers_active" (
  "phoneNumber" text,
  "contactName" text,
  "description" text,
  "isPrimaryTest" boolean,
  "createdAt" text
);

--- Table: version_history ---
CREATE TABLE IF NOT EXISTS public."version_history" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "version" text NOT NULL,
  "version_number" integer NOT NULL,
  "title" text NOT NULL,
  "subtitle" text,
  "release_date" timestamptz DEFAULT now(),
  "content" text,
  "summary" text,
  "category" text DEFAULT 'general',
  "tags" jsonb,
  "banner_image_url" text,
  "video_urls" text,
  "is_published" boolean DEFAULT false,
  "is_featured" boolean DEFAULT false,
  "author_id" uuid,
  "author_name" text,
  "view_count" integer DEFAULT 0,
  "like_count" integer DEFAULT 0,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now(),
  "published_at" timestamptz
);

--- Table: version_history_comments ---
CREATE TABLE IF NOT EXISTS public."version_history_comments" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "version_id" uuid NOT NULL,
  "user_id" uuid,
  "user_name" text NOT NULL,
  "user_email" text,
  "comment" text NOT NULL,
  "rating" integer,
  "is_approved" boolean DEFAULT true,
  "is_flagged" boolean DEFAULT false,
  "created_at" timestamptz DEFAULT now(),
  "updated_at" timestamptz DEFAULT now()
);

--- Table: version_history_files ---
CREATE TABLE IF NOT EXISTS public."version_history_files" (
  "id" uuid,
  "name" text,
  "bucket_id" text,
  "owner" uuid,
  "created_at" timestamptz,
  "updated_at" timestamptz,
  "last_accessed_at" timestamptz,
  "metadata" text,
  "public_url" text
);

--- Table: version_history_likes ---
CREATE TABLE IF NOT EXISTS public."version_history_likes" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "version_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "user_email" text,
  "user_name" text,
  "created_at" timestamptz DEFAULT now()
);

--- Table: version_history_views ---
CREATE TABLE IF NOT EXISTS public."version_history_views" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "version_id" uuid NOT NULL,
  "user_id" uuid,
  "user_email" text,
  "user_name" text,
  "ip_address" text,
  "user_agent" text,
  "viewed_at" timestamptz DEFAULT now()
);

