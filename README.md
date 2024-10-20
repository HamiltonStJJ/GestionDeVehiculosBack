# Sistema de Gestión de Alquiler de Vehículos

Este repositorio contiene el backend del **Sistema de Gestión de Alquiler de Vehículos**, diseñado para administrar de manera eficiente un negocio de alquiler de vehículos. El sistema proporciona diferentes funcionalidades según el rol de usuario: Administrador, Empleado/Agente de Alquiler y Cliente.

## Roles del Sistema

### 1. **Administrador**
   - Gestiona la información del sistema, incluyendo vehículos, clientes y usuarios.
   - Asigna y supervisa las funciones de los empleados (roles y accesos).
   - Visualiza reportes y estadísticas.

### 2. **Empleado o Agente de Alquiler**
   - Registra reservas y alquileres de vehículos.
   - Gestiona la información de clientes.
   - Gestiona devoluciones y controla el estado de los vehículos.

### 3. **Cliente**
   - Visualiza los vehículos disponibles para alquiler.
   - Realiza reservas de vehículos y gestiona sus pagos.
   - Consulta el historial de alquileres y facturas.

## Funcionalidades del Sistema

### Para el Administrador
   - **Gestión de Usuarios**: Crear, editar, asignar permisos o eliminar usuarios.
   - **Gestión de Vehículos**: Añadir nuevos vehículos al inventario, editar datos existentes, y marcar vehículos como disponibles o en mantenimiento.
   - **Reportes y Estadísticas**: Generar reportes de uso de vehículos, ingresos por alquileres, y más. (Reportes diarios, mensuales o personalizados).
   - **Gestión de Tarifas**: Configurar tarifas de alquiler según tipo de vehículo, duración del alquiler o temporada.

### Para el Empleado
   - **Gestión de Alquileres**: Registrar alquileres, verificar disponibilidad, y generar contratos y facturas.
   - **Gestión de Devoluciones**: Registrar devoluciones, inspeccionar estado del vehículo y aplicar tarifas adicionales en caso de daños o retrasos.
   - **Consulta de Disponibilidad**: Verificar en tiempo real la disponibilidad de vehículos.
   - **Facturación y Pagos**: Emitir facturas y gestionar pagos, incluyendo cargos adicionales si es necesario.

### Para el Cliente
   - **Consulta de Vehículos Disponibles**: Navegar por el catálogo de vehículos, filtrando por tipo, modelo, y precio.
   - **Reserva de Vehículos**: Realizar reservas seleccionando fechas y tipo de vehículo.
   - **Historial de Alquileres**: Consultar el historial de alquileres previos y facturas emitidas.
   - **Gestión de Pagos**: Realizar pagos en línea y consultar el estado de los mismos.

## Requerimientos del Sistema

1. **Registro y Gestión de Usuarios**: Soporta el registro de usuarios con roles de Administrador, Empleado y Cliente.
2. **Gestión de Vehículos**: Permite agregar, modificar y eliminar vehículos con atributos como marca, modelo, matrícula, disponibilidad y tarifas.
3. **Módulo de Alquiler**: Gestiona todo el ciclo del alquiler, desde la reserva hasta la devolución, con generación de contratos y facturas.
4. **Control de Disponibilidad**: Permite a los usuarios consultar la disponibilidad de vehículos en tiempo real.
5. **Gestión de Pagos y Facturación**: Administra pagos en efectivo, tarjeta o transferencia, y genera facturas automáticas.
6. **Reportes y Estadísticas**: Genera reportes automáticos sobre el rendimiento del negocio, como número de alquileres, ingresos y vehículos en mantenimiento.

## Tecnologías

Las tecnologías a utilizar para este proyecto incluyen, pero no están limitadas a:
- **Backend**: Node.js con TypeScript
- **Base de Datos**: MongoDB
- **Frontend**: React

## Instalación y Ejecución

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/HamiltonStJJ/GestionDeVehiculosBack.git
2. Inresar a la carpeta:
   ```bash
   cd GestionDeVehiculosBack
3. Instalar Dependencias:
    ```bash
   npm install
4. Ejecutar el Poryecto:   
    ```bash
   npm start
   npm run dev
   
