# Seguridad

Tomamos en serio la seguridad de **Planning Poker Free**.

## Versiones soportadas

Solo la rama `main` (última versión desplegada / del repositorio) recibe correcciones de seguridad.

## Cómo reportar una vulnerabilidad

**No** abras un issue público ni un PR que exponga el problema.

Preferencias, en este orden:

1. **GitHub Security Advisories** — reporta de forma privada desde la pestaña *Security* del repositorio (si está habilitado *Private vulnerability reporting*).
2. Contacto privado con el mantenedor listado en el [README](README.md) (GitHub o LinkedIn).

Incluye, si puedes:

- Descripción del impacto
- Pasos para reproducir
- Versión / commit afectado
- PoC mínimo (sin dañar sistemas de terceros)

## Qué esperar

- Acuse de recibo cuando sea posible
- Evaluación del impacto y, si procede, un parche o advisory
- Crédito en el aviso si lo deseas (indícalo en el reporte)

## Alcance orientativo

En alcance (ejemplos):

- Bypass de salas privadas / contraseñas
- Escalada de roles (moderación, votos)
- XSS, inyección o abuso de WebSocket que afecte a otros participantes
- Fugas de datos de sesión entre salas

Fuera de alcance (ejemplos):

- DoS por volumen sin abuso de un bug concreto
- Problemas solo en forks o despliegues de terceros no oficiales
- Reportes sin pasos reproducibles

## Divulgación responsable

Te pedimos tiempo razonable para corregir antes de publicar detalles. Coordinaremos contigo la divulgación cuando haya fix o mitigación.
