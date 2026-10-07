# A4.2 Actualizaciones perdidas e interbloqueos

Esta página usa la tabla `cuentas` de la [página anterior](01-aislamiento.md).

## La actualización perdida

El fallo de concurrencia más típico: dos personas **leen** el mismo dato, cada una calcula **un valor nuevo** a partir de lo que leyó, y **la segunda escritura machaca a la primera**. Ana tiene 100 € y dos operaciones quieren retirar dinero:

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 2 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 3 | A | `UPDATE cuentas SET saldo = 70 WHERE id = 1` | OK |
| 4 | B | `UPDATE cuentas SET saldo = 50 WHERE id = 1` | OK |
| 5 | A | `SELECT saldo FROM cuentas WHERE id = 1` | 50 |

A retiró 30 (de 100 a 70) y B retiró 50 (de 100 a 50), pero **el saldo final es 50**, no 20. **La retirada de A se ha perdido**: B calculó `100 - 50` con el saldo viejo y lo escribió encima. Nadie ha tenido ningún error y el dinero ha desaparecido. Es el fallo clásico de «**leer, calcular fuera y escribir**».

## Solución 1: que la propia sentencia haga la cuenta

La salida más sencilla: **no leer, calcular y escribir** por separado, sino dejar que **la base de datos haga la operación sobre el valor que hay en ese momento**:

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `UPDATE cuentas SET saldo = saldo - 30 WHERE id = 1` | OK |
| 2 | B | `UPDATE cuentas SET saldo = saldo - 50 WHERE id = 1` | OK |
| 3 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 20 |
| 4 | A | `UPDATE cuentas SET saldo = saldo - 30 WHERE id = 1` | **ERROR:** CHECK constraint failed: saldo >= 0 |

Con `saldo = saldo - 30`, cada sentencia parte del valor **actual**, y el resultado correcto es **20**. Una sentencia `UPDATE` es **atómica**: se ejecuta entera o no se ejecuta. Y fíjate en el último paso: una tercera retirada de 30 dejaría el saldo en `-10`, pero **la restricción `CHECK (saldo >= 0)` la rechaza** y el dato no se estropea. **Las restricciones son la última línea de defensa**, y funcionan aunque el programa falle.

## Solución 2: bloquear antes de leer

Si hace falta **leer, decidir y escribir** en pasos distintos (por ejemplo, para comprobar varias condiciones), se usa **`BEGIN IMMEDIATE`**: la sesión pide el permiso de escritura **antes de leer**, y la otra **no puede empezar** hasta que termine:

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `BEGIN IMMEDIATE` | OK |
| 2 | A | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 3 | B | `BEGIN IMMEDIATE` | **ERROR:** database is locked |
| 4 | A | `UPDATE cuentas SET saldo = 70 WHERE id = 1` | OK |
| 5 | A | `COMMIT` | OK |
| 6 | B | `BEGIN IMMEDIATE` | OK |
| 7 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 70 |
| 8 | B | `UPDATE cuentas SET saldo = 20 WHERE id = 1` | OK |
| 9 | B | `COMMIT` | OK |

B no puede empezar mientras A trabaja (paso 3). Cuando A termina, B **empieza de cero y lee el saldo ya actualizado** (`70`, paso 7) y sigue desde ahí. En MySQL, PostgreSQL y Oracle se consigue lo mismo bloqueando **solo la fila** con `SELECT ... FOR UPDATE`, que SQLite no tiene.

## Solución 3: control optimista

Los bloqueos tienen un precio: la gente **espera**. En aplicaciones web, donde alguien puede abrir un formulario, **tardar diez minutos** y guardar, bloquear no es viable. Para eso se usa el **control optimista**: **no se bloquea**, pero se **comprueba al escribir que nadie ha cambiado el dato mientras tanto**. Se añade una columna `version` que **sube en cada modificación**:

```sql
CREATE TABLE documentos (
  id      INTEGER PRIMARY KEY,
  texto   TEXT    NOT NULL,
  version INTEGER NOT NULL
);
INSERT INTO documentos VALUES (1, 'borrador', 1);
```

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `SELECT texto, version FROM documentos WHERE id = 1` | [('borrador', 1)] |
| 2 | B | `SELECT texto, version FROM documentos WHERE id = 1` | [('borrador', 1)] |
| 3 | A | `UPDATE documentos SET texto = 'versión de A', version = version + 1 WHERE id = 1 AND version = 1` | OK |
| 4 | A | `SELECT changes()` | 1 |
| 5 | B | `UPDATE documentos SET texto = 'versión de B', version = version + 1 WHERE id = 1 AND version = 1` | OK |
| 6 | B | `SELECT changes()` | 0 |
| 7 | B | `SELECT texto, version FROM documentos WHERE id = 1` | [('versión de A', 2)] |

Los dos leen la versión `1`. A guarda su cambio con `WHERE ... AND version = 1`: funciona (`changes()` es **1**) y la versión pasa a `2`. Cuando B intenta guardar **con la versión que él leyó** (`1`), ya no coincide con ninguna fila: **`changes()` es 0**, y B sabe que **alguien se le ha adelantado**. Entonces no machaca nada: **avisa al usuario** («este documento ha cambiado») o vuelve a leer y reintenta.

## Interbloqueos

Un **interbloqueo** (*deadlock*) ocurre cuando **dos sesiones se esperan la una a la otra** y ninguna puede continuar. Con dos transacciones que **leen primero y quieren escribir después**, SQLite lo muestra en miniatura:

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `BEGIN` | OK |
| 2 | A | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 3 | B | `BEGIN` | OK |
| 4 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 5 | A | `UPDATE cuentas SET saldo = 70 WHERE id = 1` | OK |
| 6 | B | `UPDATE cuentas SET saldo = 50 WHERE id = 1` | **ERROR:** database is locked |
| 7 | A | `COMMIT` | **ERROR:** database is locked |
| 8 | B | `ROLLBACK` | OK |
| 9 | A | `COMMIT` | OK |

Los dos tienen una transacción abierta con una lectura. **B no puede escribir** porque A ya lo está haciendo (paso 6), y **A no puede confirmar** porque B sigue leyendo (paso 7): cada uno espera al otro. Si las dos sesiones esperaran con un tiempo de espera largo, **no avanzarían nunca**. La salida es que **una abandone**: B deshace (`ROLLBACK`, paso 8) y A ya puede confirmar (paso 9). Los motores con bloqueos por filas (MySQL, PostgreSQL, Oracle, SQL Server) **detectan los interbloqueos** y **cancelan una de las dos transacciones** con un error, que la aplicación debe **capturar y reintentar**.

Las dos reglas para evitarlos:

* **Transacciones cortas**: cuanto menos dure, menos tiempo hay para cruzarse.
* **Mismo orden siempre**: si todas las transacciones bloquean primero la cuenta de menor `id` y después la mayor, **no se pueden cruzar**.

## Qué elegir

| Situación | Técnica |
|---|---|
| Sumar, restar o incrementar un valor | **Una sola sentencia**: `SET saldo = saldo - 30` |
| Que un valor nunca pase de ciertos límites | Restricción **`CHECK`** (siempre) |
| Leer, decidir y escribir en varios pasos, y poco tiempo entre medias | **`BEGIN IMMEDIATE`** (o `SELECT ... FOR UPDATE` en otros motores) |
| Edición larga (un formulario, un documento) | **Control optimista** con una columna `version` |
| Muchos lectores y pocos escritores en SQLite | Modo **WAL** |

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| «Leer, calcular en el programa y escribir» | Que la **sentencia SQL** haga la cuenta |
| Confiar en que «dos personas a la vez es raro» | En producción ocurre **todos los días**, y a destiempo, sin avisar |
| Un bloqueo mantenido mientras el usuario piensa | Control optimista: nunca esperes a una persona con un bloqueo |
| No comprobar `changes()` (filas afectadas) tras un `UPDATE` condicional | Es la forma de saber **si la actualización llegó a hacerse** |
| Reintentar sin límite ni pausa | Unos pocos intentos, con una pequeña espera creciente |

## Para practicar

Los ejercicios SA4.3 a SA4.6 de [SA4 · Ejercicios](ejercicios.md) piden control optimista, `SAVEPOINT` y reservas protegidas.
