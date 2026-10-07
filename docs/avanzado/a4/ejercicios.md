# SA4 · Ejercicios de concurrencia

<div class="ej-gate" data-unit="a4" data-nombre="A4 · Concurrencia en la base de datos"></div>

Estos ejercicios trabajan desde **una sola sesión**, pero con las técnicas que evitan los problemas de la concurrencia. Usan las tablas `cuentas` y `documentos` de las [páginas A4.1](01-aislamiento.md) y [A4.2](02-perdidas.md) y la tabla `eventos` que se da en el SA4.5: en cada ejercicio la base de datos **parte de cero**, así que incluye tú las sentencias de creación. Escribe tú toda la solución.

## Ejercicio SA4.1

**Una transferencia atómica.** Con la tabla `cuentas`: transfiere **30** de Ana (`id = 1`) a Luis (`id = 2`) **en una sola transacción** y muestra `titular` y `saldo` de las dos cuentas, ordenadas por `id`.

Para crear la tabla:

```sql
CREATE TABLE cuentas (
  id      INTEGER PRIMARY KEY,
  titular TEXT    NOT NULL,
  saldo   INTEGER NOT NULL CHECK (saldo >= 0)
);
INSERT INTO cuentas VALUES (1, 'Ana', 100), (2, 'Luis', 50);
```

**Resultado esperado:**

| titular | saldo |
|---|---|
| Ana | 70 |
| Luis | 80 |

*2 filas*

<details class="sol" data-key="sql/a4/SA4.1">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE cuentas (
  id      INTEGER PRIMARY KEY,
  titular TEXT    NOT NULL,
  saldo   INTEGER NOT NULL CHECK (saldo &gt;= 0)
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA4.2

**Una retirada protegida.** Con la tabla `cuentas`: intenta retirar **150** de la cuenta de Ana (que solo tiene 100) con **una sola sentencia** `UPDATE` que **no deje el saldo negativo y no dé error**: debe limitarse a **no hacer nada** si no hay saldo suficiente. Después muestra `titular` y `saldo` de las dos cuentas, ordenadas por `id`.

**Resultado esperado:**

| titular | saldo |
|---|---|
| Ana | 100 |
| Luis | 50 |

*2 filas*

<details class="sol" data-key="sql/a4/SA4.2">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE cuentas (
  id      INTEGER PRIMARY KEY,
  titular TEXT    NOT NULL,
  saldo   INTEGER NOT NULL CHECK (saldo &gt;= 0)
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA4.3

**Control optimista.** Con la tabla `documentos` (para crearla, usa el script de la página A4.2):

```sql
CREATE TABLE documentos (
  id      INTEGER PRIMARY KEY,
  texto   TEXT    NOT NULL,
  version INTEGER NOT NULL
);
INSERT INTO documentos VALUES (1, 'borrador', 1);
```

Simula **dos ediciones** que leyeron la versión `1`: primero una guarda el texto `edición 1` y, después, otra intenta guardar `edición 2` **con la versión `1` que leyó**. Usa `WHERE id = 1 AND version = 1` y sube la versión en cada cambio. Muestra el `texto` y la `version` finales: la segunda edición **no debe haber machacado** a la primera.

**Resultado esperado:**

| texto | version |
|---|---|
| edición 1 | 2 |

*1 fila*

<details class="sol" data-key="sql/a4/SA4.3">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE documentos (
  id      INTEGER PRIMARY KEY,
  texto   TEXT    NOT NULL,
  version INTEGER NOT NULL
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA4.4

**Deshacer solo una parte.** Con la tabla `cuentas`, en **una transacción**: **(1)** pon el saldo de Ana a `80`; **(2)** crea un `SAVEPOINT` llamado `intermedio`; **(3)** pon el saldo de Luis a `0`; **(4)** vuelve al `SAVEPOINT` (deshaciendo solo lo de Luis); **(5)** confirma. Muestra `titular` y `saldo` de las dos cuentas, ordenadas por `id`.

**Resultado esperado:**

| titular | saldo |
|---|---|
| Ana | 80 |
| Luis | 50 |

*2 filas*

<details class="sol" data-key="sql/a4/SA4.4">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE cuentas (
  id      INTEGER PRIMARY KEY,
  titular TEXT    NOT NULL,
  saldo   INTEGER NOT NULL CHECK (saldo &gt;= 0)
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA4.5

**Reservar entradas sin pasarse.** Crea esta tabla:

```sql
CREATE TABLE eventos (
  id     INTEGER PRIMARY KEY,
  nombre TEXT    NOT NULL,
  libres INTEGER NOT NULL CHECK (libres >= 0)
);
INSERT INTO eventos VALUES (1, 'Concierto', 5);
```

Haz **dos reservas de 3 entradas** seguidas, cada una con **una sola sentencia** `UPDATE` que solo se aplique si **quedan suficientes** (`libres >= 3`). La segunda no debe poder hacerse. Muestra las entradas `libres` que quedan.

**Resultado esperado:**

| libres |
|---|
| 2 |

*1 fila*

<details class="sol" data-key="sql/a4/SA4.5">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE eventos (
  id     INTEGER PRIMARY KEY,
  nombre TEXT    NOT NULL,
  libres INTEGER NOT NULL CHECK (libres &gt;= 0)
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>

## Ejercicio SA4.6

**El total no cambia.** Con la tabla `cuentas`: haz **dos transferencias** (de Ana a Luis `20` y, después, de Luis a Ana `5`), cada una en **su propia transacción**, y muestra una sola columna `total` con la **suma de los saldos** de todas las cuentas. Debe seguir siendo la misma que al principio.

**Resultado esperado:**

| total |
|---|
| 150 |

*1 fila*

<details class="sol" data-key="sql/a4/SA4.6">
<summary>Solución modelo (bloqueada)</summary>
<div class="sol-body"><p class="sol-aviso">🔒 La solución completa está bloqueada. Esto es solo un ejemplo de cómo empieza:</p><pre><code>CREATE TABLE cuentas (
  id      INTEGER PRIMARY KEY,
  titular TEXT    NOT NULL,
  saldo   INTEGER NOT NULL CHECK (saldo &gt;= 0)
);
-- ... (resto de la solución bloqueado)</code></pre></div>
</details>
