# ContaClaridad 📊

ContaClaridad es una aplicación web premium diseñada para que las pequeñas y medianas empresas (PyMEs) puedan calcular, analizar y llevar el control absoluto de sus finanzas y utilidades en tiempo real.

Con una interfaz intuitiva, moderna y dinámica, el sistema permite registrar transacciones y generar automáticamente Estados de Resultados mensuales estructurados bajo estándares contables profesionales.

---

## 🚀 Características Principales

* **Cálculo de Utilidad al Instante:** Registra ingresos, costos de ventas, gastos operativos, gastos financieros e impuestos para obtener de forma automática la utilidad bruta, operativa, antes de impuestos y neta.
* **Estado de Resultados Mensual:** Generación visual y descargable del estado financiero mensual.
* **Soporte Multimoneda Inteligente:** Permite a los clientes cambiar la moneda de visualización y cálculo (Dólar `USD` o Peso Dominicano `DOP`) adaptando todas las tablas e inputs dinámicamente.
* **Suscripción Premium integrada con PayPal:** Acceso a reportes contables avanzados a través de un plan Premium configurable de $27.00 USD/mes con pasarela de pagos integrada.
* **Panel de Administración Avanzado:**
  * Gestión de clientes registrados.
  * Historial de transacciones registradas de PayPal.
  * Analíticas interactivas en tiempo real con gráficos SVG personalizados (ingresos mensuales, registros de usuarios, distribución de monedas preferidas).
  * Configuración dinámica de precios de planes y credenciales del cliente de PayPal.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React (Vite), Vanilla CSS (diseño responsivo, animaciones dinámicas, modo premium).
* **Backend:** Node.js, Express.js, JWT para autenticación segura.
* **Base de Datos:** MySQL.
* **Integraciones:** SDK de PayPal Smart Buttons.

---

## ⚙️ Instrucciones de Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/11carlosivan/ContaClaridad.git
cd ContaClaridad
```

### 2. Configurar la Base de Datos
1. Crea una base de datos MySQL en tu servidor local llamada `contaclaridad_db`.
2. Importa el archivo de base de datos ubicado en [`database/schema.sql`](./database/schema.sql) para estructurar las tablas iniciales e inicializar la configuración de administrador por defecto.

### 3. Configurar el Backend (Servidor)
1. Ve al directorio del servidor:
   ```bash
   cd server
   ```
2. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
3. Copia el archivo de ejemplo para configurar tus variables de entorno locales:
   ```bash
   copy .env.example .env
   ```
4. Edita el archivo `.env` configurando los accesos a tu base de datos local y una clave secreta para JWT.
5. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### 4. Configurar el Frontend (Cliente)
1. Abre una nueva terminal en el directorio raíz de la aplicación e ingresa a la carpeta del cliente:
   ```bash
   cd client
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

---

## 🔑 Credenciales de Acceso por Defecto (Entorno de Pruebas)

* **Administrador:**
  * **Email:** `admin@contaclaridad.com`
  * **Contraseña:** `admin123`
* **Cliente de Prueba:**
  * **Email:** `contacto@mueblesdelsol.com`
  * **Contraseña:** `password123`

---

Desarrollado con ❤️ para simplificar la contabilidad de las PyMEs.
