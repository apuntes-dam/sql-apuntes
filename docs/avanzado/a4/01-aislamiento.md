# A4.1 Aislamiento y bloqueos en la práctica

!!! info "Para quién es esto"
    Es material **avanzado**. Da por sabido `BEGIN`, `COMMIT` y `ROLLBACK` de la [unidad 6](../../u06/04-transacciones.md).

## Dos sesiones sobre la misma base de datos

Una **sesión** es una conexión a la base de datos. Dos personas usando una aplicación son dos sesiones. Para verlo, los ejemplos de esta página son **conversaciones entre una sesión A y una sesión B**, ejecutadas de verdad sobre **SQLite** en un archivo, una conexión por sesión y **sin esperar**: si una sesión se queda bloqueada, se ve el **error real** en lugar de quedarse esperando. Todas parten de esta tabla:

```sql
CREATE TABLE cuentas (
  id      INTEGER PRIMARY KEY,
  titular TEXT    NOT NULL,
  saldo   INTEGER NOT NULL CHECK (saldo >= 0)
);
INSERT INTO cuentas VALUES (1, 'Ana', 100), (2, 'Luis', 50);
```

## Leer mientras otra sesión escribe

La sesión A empieza una transacción y cambia el saldo de Ana, **sin terminar**. ¿Qué ve B?

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `BEGIN` | OK |
| 2 | A | `UPDATE cuentas SET saldo = 70 WHERE id = 1` | OK |
| 3 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 4 | A | `COMMIT` | OK |
| 5 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 70 |

En el paso 3, B ve **100**: el valor de **antes** del cambio. No ve el `70` que A todavía no ha confirmado. Es lo que se llama **aislamiento**: **los cambios de una transacción no se ven desde fuera hasta el `COMMIT`**. Después del `COMMIT` de A (paso 4), la consulta del paso 5 ya ve el valor nuevo. Si B hubiera visto el `70` y luego A hubiera hecho `ROLLBACK`, B habría trabajado con un dato que **nunca existió**: una **lectura sucia**, que el aislamiento evita.

## Dos escritores a la vez

Los cambios no pueden mezclarse, así que **solo una sesión puede estar escribiendo a la vez**. La segunda **espera o falla**:

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `BEGIN` | OK |
| 2 | A | `UPDATE cuentas SET saldo = 70 WHERE id = 1` | OK |
| 3 | B | `BEGIN` | OK |
| 4 | B | `UPDATE cuentas SET saldo = 40 WHERE id = 2` | **ERROR:** database is locked |
| 5 | B | `ROLLBACK` | OK |
| 6 | A | `COMMIT` | OK |
| 7 | B | `UPDATE cuentas SET saldo = 40 WHERE id = 2` | OK |
| 8 | B | `SELECT * FROM cuentas` | [(1, 'Ana', 70), (2, 'Luis', 40)] |

En el paso 4, B intenta modificar **otra fila distinta** (la de Luis) y aun así falla con **`database is locked`**. SQLite bloquea **la base de datos entera** para escribir. Otros motores (MySQL con InnoDB, PostgreSQL, Oracle) bloquean **solo la fila afectada**, y B habría podido actualizar a Luis sin esperar. Una vez que A termina (paso 6), B repite y ya puede (paso 7).

!!! note "Fallar o esperar"
    Aquí las sesiones **no esperan** (así se ve el error). Una aplicación normal configura un **tiempo de espera** (en SQLite, `PRAGMA busy_timeout = 5000`): la sesión bloqueada **espera hasta 5 segundos** a que se libere el candado antes de fallar. Y siempre debe estar preparada para **reintentar**.

## BEGIN IMMEDIATE: fallar pronto

Una transacción normal (`BEGIN`) **no pide el permiso de escritura hasta que escribe**. Si ya sabes que vas a escribir, **`BEGIN IMMEDIATE`** lo pide **al empezar**: si hay otra sesión escribiendo, falla **ya**, antes de haber hecho nada:

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `BEGIN IMMEDIATE` | OK |
| 2 | B | `BEGIN IMMEDIATE` | **ERROR:** database is locked |
| 3 | A | `COMMIT` | OK |
| 4 | B | `BEGIN IMMEDIATE` | OK |
| 5 | B | `COMMIT` | OK |

## Cuando un lector bloquea a un escritor

En el modo normal de SQLite (el diario de reversión), **un lector con una transacción abierta puede impedir que otra sesión confirme**:

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `BEGIN` | OK |
| 2 | A | `UPDATE cuentas SET saldo = 70 WHERE id = 1` | OK |
| 3 | B | `BEGIN` | OK |
| 4 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 5 | A | `COMMIT` | **ERROR:** database is locked |
| 6 | B | `COMMIT` | OK |
| 7 | A | `COMMIT` | OK |

Mientras B está **leyendo dentro de una transacción**, A no puede terminar (paso 5, **`database is locked`**). Cuando B acaba (paso 6), A ya puede confirmar (paso 7). Es incómodo: **las lecturas bloquean a las escrituras**.

### El modo WAL

SQLite tiene otro modo, **WAL** (*write-ahead log*, `PRAGMA journal_mode = WAL`), en el que **lectores y escritor no se estorban**. El mismo experimento:

| Paso | Sesión | Sentencia | Resultado |
|---|---|---|---|
| 1 | A | `BEGIN` | OK |
| 2 | A | `UPDATE cuentas SET saldo = 70 WHERE id = 1` | OK |
| 3 | B | `BEGIN` | OK |
| 4 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 5 | A | `COMMIT` | OK |
| 6 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 100 |
| 7 | B | `COMMIT` | OK |
| 8 | B | `SELECT saldo FROM cuentas WHERE id = 1` | 70 |

Ahora A **confirma sin problema** (paso 5) aunque B esté leyendo. Y mira lo que ve B: en el paso 6, **sigue viendo `100`**, aunque A ya haya confirmado el `70`. Mientras dura su transacción, B trabaja sobre una **instantánea** de la base de datos tal y como estaba cuando empezó a leer. Hasta que no termina su transacción (paso 7) no ve el valor nuevo (paso 8). A esto se le llama **lectura repetible**: dentro de una transacción, **leer lo mismo dos veces da lo mismo**.

| | Modo normal (diario) | Modo WAL |
|---|---|---|
| ¿Un lector bloquea al escritor? | **Sí**, al confirmar | **No** |
| ¿Un escritor bloquea a los lectores? | Solo en el momento de confirmar | **No** |
| ¿Varios escritores a la vez? | **No**, solo uno | **No**, solo uno |
| Leer varias veces dentro de una transacción | Nadie puede confirmar mientras tanto, así que **no cambia** | El lector ve una **instantánea** y el escritor confirma sin esperar |

## Los niveles de aislamiento

El estándar SQL define **cuánto aislamiento** da una transacción, de menos a más. Cada nivel evita más problemas, y **cuesta más** (más esperas, o más transacciones que se cancelan):

| Nivel | Evita lecturas sucias | Evita lecturas no repetibles | Evita lecturas fantasma |
|---|---|---|---|
| `READ UNCOMMITTED` | No | No | No |
| `READ COMMITTED` | **Sí** | No | No |
| `REPEATABLE READ` | **Sí** | **Sí** | No (según el motor) |
| `SERIALIZABLE` | **Sí** | **Sí** | **Sí** |

* **Lectura sucia**: ver un cambio que **no está confirmado**.
* **Lectura no repetible**: leer una fila dos veces en la misma transacción y obtener **dos valores** porque otra la modificó entre medias.
* **Lectura fantasma**: repetir una consulta y que **aparezcan o desaparezcan filas** nuevas.

| Motor | Nivel por defecto |
|---|---|
| **PostgreSQL**, **Oracle**, **SQL Server** | `READ COMMITTED` |
| **MySQL** (InnoDB) | `REPEATABLE READ` |
| **SQLite** | Efectivamente `SERIALIZABLE`: solo hay un escritor a la vez |

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Dejar una transacción **abierta** y marcharse | Es lo que más bloquea: abre, haz lo mínimo y confirma o deshaz **pronto** |
| No gestionar el error de bloqueo | Captúralo y **reintenta** unas pocas veces con una pequeña espera |
| Leer mucho dentro de una transacción de escritura | Prepara los datos **antes** de `BEGIN` |
| Suponer que otro motor bloquea igual que SQLite | SQLite bloquea la base de datos entera; los demás, filas |
| Usar `READ UNCOMMITTED` «para ir más rápido» | Solo con datos que pueden estar mal sin consecuencias |

## Para practicar

Los ejercicios SA4.1 y SA4.2 de [SA4 · Ejercicios](ejercicios.md) practican transacciones y protección de los datos desde una sola sesión.
