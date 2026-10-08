# SQL y bases de datos

Apuntes y ejercicios para aprender **SQL**, el lenguaje de las bases de datos relacionales: desde la primera consulta hasta el diseño de tablas, las uniones, las agrupaciones y las transacciones. Es el complemento de la unidad de **bases de datos** de las webs de [lenguajes](https://apuntes-dam.github.io/apuntes-lenguajes/), donde se usa SQL desde Dart, Java, Kotlin y Python.

!!! question "¿Y las bases de datos no relacionales?"
    Esta web trata de las **relacionales** (tablas, filas y SQL), que son las más usadas. Existen también las **no relacionales** (**NoSQL**), que guardan los datos de otra forma: documentos, pares clave-valor, columnas o grafos. La diferencia en una frase: la relacional **reparte los datos en tablas unidas por claves y con un esquema fijo**; la no relacional **suele guardar cada elemento completo y con la forma que necesite**.

    | | Relacional | No relacional |
    |---|---|---|
    | **Datos** | Tablas con **esquema fijo** | Documentos, clave-valor, columnas o grafos, con **esquema flexible** |
    | **Relaciones** | **Claves foráneas** y `JOIN` | Datos **anidados** o referencias que gestiona el programa |
    | **Lenguaje** | **SQL**, el mismo (con matices) en todos los motores | Uno propio **en cada motor** |
    | **Garantías** | **ACID**: transacciones completas | A menudo **BASE**: se prima la velocidad y la disponibilidad |
    | **Ejemplos** | SQLite, MySQL, PostgreSQL, Oracle | MongoDB, Redis, Cassandra, Neo4j |

    Ninguna es «mejor»: se elige según el problema. Lo explicamos con ejemplos ejecutados en la [U7 · Bases de datos no relacionales](u07/index.md).

!!! info "Cómo está organizado"
    Siete unidades, de menos a más. Cada unidad tiene su teoría y, debajo, sus **ejercicios**, que se desbloquean al marcar la unidad como leída. En los ejercicios aparece el **resultado esperado** para que puedas comprobar tu consulta, y la **solución modelo** está bloqueada.

| Unidad | Contenido |
|---|---|
| [U1 · Primeros pasos](u01/index.md) | Qué es una base de datos, `SELECT`, `WHERE`, ordenar, limitar y funciones |
| [U2 · Diseño de bases de datos](u02/index.md) | Modelo entidad-relación, paso a tablas y normalización |
| [U3 · Crear y modificar datos](u03/index.md) | `CREATE TABLE`, restricciones, `INSERT`, `UPDATE`, `DELETE`, `ALTER` y `DROP` |
| [U4 · Varias tablas](u04/index.md) | `JOIN`, `LEFT JOIN`, `UNION`, `INTERSECT` y `EXCEPT` |
| [U5 · Agrupar y subconsultas](u05/index.md) | `COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING` y subconsultas |
| [U6 · SQL avanzado](u06/index.md) | `CASE`, vistas, índices, transacciones, `WITH`, funciones de ventana y *triggers* |
| [U7 · Bases de datos no relacionales](u07/index.md) | Bases **no relacionales** (NoSQL): documentos, clave-valor, columnas y grafos; en qué se diferencian de las relacionales y cuándo usar cada una |
| [Diferencias entre motores](diferencias.md) | Qué cambia entre SQLite, MySQL, PostgreSQL y Oracle |
| [Chuleta de SQL](chuleta.md) | Las sentencias más usadas en una página |

!!! tip "Resultados reales"
    Todos los resultados que ves en las páginas se han obtenido **ejecutando el SQL** de verdad sobre **SQLite**, con una base de datos de ejemplo de un instituto (datos ficticios). Donde otros motores (MySQL, PostgreSQL, Oracle) escriben las cosas de otra forma, se indica.

!!! note "Empieza por aquí"
    Si nunca has escrito una consulta, empieza por [1.1 Bases de datos y SQL](u01/01-bases-de-datos.md): ahí está la base de datos de ejemplo y cómo crearla en tu equipo.

!!! tip "¿Quieres ir más allá?"
    Activa el interruptor **Avanzado** de la cabecera para ver el [material avanzado](avanzado/index.md): ventanas a fondo, recursión, rendimiento, concurrencia y SQL moderno.
