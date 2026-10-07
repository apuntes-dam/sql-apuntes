# A5.1 UPSERT, RETURNING y copias de datos

!!! info "Para quién es esto"
    Es material **avanzado**. Da por sabido `INSERT`, `UPDATE` y las claves primarias de la [unidad 3](../../u03/index.md).

## El problema: insertar o actualizar

Un contador de visitas por página: la primera vez que se visita una página hay que **insertar** su fila con un `1`; las siguientes, **sumarle uno** a la que ya existe. Escrito «a mano» en la aplicación sale algo así: «consulto si existe; si existe, `UPDATE`; si no, `INSERT`». Ese **«comprobar y después actuar»** tiene un fallo de concurrencia: si dos visitas llegan a la vez, **las dos comprueban que no existe** y **las dos intentan insertar** (como en la [A4.2](../a4/02-perdidas.md)).

## UPSERT: una sola sentencia

El **UPSERT** (de *update* + *insert*) lo resuelve **en una sola sentencia atómica**: se intenta insertar y, **si la clave ya existe**, se hace una actualización en su lugar.

Para reproducir los ejemplos, parte de esta tabla:

```sql
CREATE TABLE visitas (
  pagina TEXT    PRIMARY KEY,
  total  INTEGER NOT NULL
);
```

```sql
INSERT INTO visitas VALUES ('inicio', 1)
  ON CONFLICT(pagina) DO UPDATE SET total = total + 1;
INSERT INTO visitas VALUES ('inicio', 1)
  ON CONFLICT(pagina) DO UPDATE SET total = total + 1;
INSERT INTO visitas VALUES ('contacto', 1)
  ON CONFLICT(pagina) DO UPDATE SET total = total + 1;

SELECT pagina, total FROM visitas ORDER BY pagina;
```

Resultado:

| pagina | total |
|---|---|
| contacto | 1 |
| inicio | 2 |

*2 filas*

Se lee así: **«inserta esta fila; pero si ya hay una con la misma `pagina` (el `CONFLICT`), en vez de fallar, haz este `UPDATE`»**. La página `inicio` se ha insertado la primera vez y la segunda se ha incrementado (`total` vale 2); `contacto` solo se ha insertado.

### La fila «excluida»

Dentro del `DO UPDATE`, **`excluded`** es la fila que **se intentaba insertar**. Sirve para usar sus valores. Un almacén que recibe mercancía: si el producto ya existe, **suma** la cantidad recibida; si no, lo crea:

```sql
INSERT INTO stock (producto, cantidad) VALUES ('café', 5), ('zumo', 3)
  ON CONFLICT(producto) DO UPDATE SET cantidad = cantidad + excluded.cantidad;

SELECT producto, cantidad, nota FROM stock ORDER BY producto;
```

Resultado:

| producto | cantidad | nota |
|---|---|---|
| café | 15 | pedir más |
| té | 4 | NULL |
| zumo | 3 | NULL |

*3 filas*

El café ya existía con 10 y se le suman los 5 que llegan (`15`); el zumo es nuevo y se crea con 3; el té ni se toca. Fíjate en que **el café conserva su `nota`** (`pedir más`): el `UPDATE` solo cambia **lo que dice** el `SET`.

### DO NOTHING: ignorar los repetidos

Si lo que quieres es que **un duplicado no dé error ni cambie nada**, se escribe `DO NOTHING`. Es útil para **repetir una carga sin miedo**: la segunda vez no hace nada.

```sql
INSERT INTO visitas VALUES ('inicio', 1) ON CONFLICT(pagina) DO NOTHING;
INSERT INTO visitas VALUES ('inicio', 99) ON CONFLICT(pagina) DO NOTHING;

SELECT pagina, total FROM visitas;
```

Resultado:

| pagina | total |
|---|---|
| inicio | 1 |

*1 fila*

## Lo mismo en otros motores

| Motor | Cómo se escribe |
|---|---|
| **SQLite**, **PostgreSQL** | `INSERT ... ON CONFLICT (columna) DO UPDATE SET ...` / `DO NOTHING` |
| **MySQL** | `INSERT ... ON DUPLICATE KEY UPDATE total = total + 1`; para ignorar: `INSERT IGNORE` |
| **Oracle**, **SQL Server** | La sentencia **`MERGE`**, más larga, que cubre también el borrado |

## Cuidado con INSERT OR REPLACE

SQLite tiene otra forma, **`INSERT OR REPLACE`**, que parece lo mismo, pero **no lo es**: cuando hay conflicto, **borra la fila entera y la inserta de nuevo**. Todo lo que no mencionas **vuelve a su valor por defecto** (`NULL`), y se **disparan los borrados** (claves foráneas con `ON DELETE CASCADE`, *triggers*...). Con la misma tabla, el café pierde su nota:

```sql
INSERT OR REPLACE INTO stock (producto, cantidad) VALUES ('café', 12);

SELECT producto, cantidad, nota FROM stock WHERE producto = 'café';
```

Resultado:

| producto | cantidad | nota |
|---|---|---|
| café | 12 | NULL |

*1 fila*

La `nota` ha desaparecido (`NULL`). Con el UPSERT de antes se conservaba. **Prefiere `ON CONFLICT ... DO UPDATE`** salvo que de verdad quieras reemplazar la fila entera.

## RETURNING: recuperar lo que acabas de modificar

A menudo, justo después de insertar, actualizar o borrar, **necesitas saber qué ha pasado**: qué `id` se ha asignado, cómo ha quedado el valor, qué filas se han borrado. Antes eso eran **dos sentencias** (la modificación y un `SELECT`), con otra posibilidad de carrera entre ellas. **`RETURNING`** las junta: la sentencia **devuelve las filas** que ha tocado.

```sql
UPDATE stock
SET cantidad = cantidad - 1
WHERE producto = 'café'
RETURNING producto, cantidad;
```

Resultado:

| producto | cantidad |
|---|---|
| café | 9 |

*1 fila*

Funciona igual con `INSERT` (devuelve las filas insertadas, con los valores que **ha calculado** la base de datos, como un `id` automático) y con `DELETE` (devuelve **lo que se ha borrado**):

```sql
DELETE FROM stock
WHERE cantidad < 5
RETURNING producto, cantidad;
```

Resultado:

| producto | cantidad |
|---|---|
| té | 4 |

*1 fila*

| Motor | Equivalente de `RETURNING` |
|---|---|
| **SQLite** (desde 3.35), **PostgreSQL** | `RETURNING` |
| **SQL Server** | `OUTPUT inserted.columna` / `OUTPUT deleted.columna` |
| **Oracle** | `RETURNING ... INTO` (a variables) |
| **MySQL** | No lo tiene (MariaDB sí, para `INSERT` y `DELETE`) |

## INSERT ... SELECT: copiar datos

`INSERT` puede tomar las filas **de una consulta** en lugar de una lista de valores. Sirve para **copiar** datos entre tablas, **archivar** filas antiguas o **construir una tabla resumen**:

```sql
INSERT INTO destino (columna1, columna2)
SELECT origen1, origen2 FROM origen WHERE condicion;
```

Se combina bien con `RETURNING` y con `ON CONFLICT`: **«copia lo que falte y actualiza lo que ya está»**, todo en una sola sentencia.

## Errores frecuentes

| Error | Cómo evitarlo |
|---|---|
| Comprobar si existe con un `SELECT` y luego insertar o actualizar | Una sola sentencia con `ON CONFLICT` |
| `ON CONFLICT` sin indicar la columna de la clave | En SQLite hay que decir **qué restricción** (`ON CONFLICT(pagina)`) |
| Confundir `excluded.cantidad` con `cantidad` | `cantidad` es el valor **que hay**; `excluded.cantidad`, el que **llega** |
| Usar `INSERT OR REPLACE` para «actualizar» | Reemplaza la fila **entera**: usa el UPSERT |
| Hacer `UPDATE` y luego `SELECT` para ver el resultado | `RETURNING` en la misma sentencia |
| Dar por hecho que `RETURNING` existe en todos los motores | Mira la tabla de equivalentes |

## Para practicar

Los ejercicios SA5.1 a SA5.4 de [SA5 · Ejercicios](ejercicios.md) practican el UPSERT, `RETURNING` y `INSERT ... SELECT`.
