package com.umg.examen.service;

/** Motivo por el que se revoca una sesión (refresh tokens). Se guarda en refresh_tokens.revoked_reason. */
public enum RevocationReason {
    /** El usuario cerró sesión manualmente. */
    LOGOUT,
    /** El frontend cerró la sesión por inactividad del usuario. */
    INACTIVITY;

    /** Convierte el motivo informado por el cliente; cualquier valor desconocido se trata como cierre manual. */
    public static RevocationReason from(String value) {
        return "INACTIVITY".equalsIgnoreCase(value) ? INACTIVITY : LOGOUT;
    }
}
