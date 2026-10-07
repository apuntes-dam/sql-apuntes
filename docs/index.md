# SQL y bases de datos

Apuntes y ejercicios para aprender **SQL**, el lenguaje de las bases de datos relacionales: desde la primera consulta hasta el diseño de tablas, las uniones, las agrupaciones y las transacciones. Es el complemento de la unidad de **bases de datos** de las webs de [lenguajes](https://apuntes-dam.github.io/apuntes-lenguajes/), donde se usa SQL desde Dart, Java, Kotlin y Python.

!!! info "Cómo está organizado"
    Seis unidades, de menos a más. Cada unidad tiene su teoría y, debajo, sus **ejercicios**, que se desbloquean al marcar la unidad como leída. En los ejercicios aparece el **resultado esperado** para que puedas comprobar tu consulta, y la **solución modelo** está bloqueada.

| Unidad | Contenido |
|---|---|
| [U1 · Primeros pasos](u01/index.md) | Qué es una base de datos, `SELECT`, `WHERE`, ordenar, limitar y funciones |
| [U2 · Diseño de bases de datos](u02/index.md) | Modelo entidad-relación, paso a tablas y normalización |
| [U3 · Crear y modificar datos](u03/index.md) | `CREATE TABLE`, restricciones, `INSERT`, `UPDATE`, `DELETE`, `ALTER` y `DROP` |
| [U4 · Varias tablas](u04/index.md) | `JOIN`, `LEFT JOIN`, `UNION`, `INTERSECT` y `EXCEPT` |
| [U5 · Agrupar y subconsultas](u05/index.md) | `COUNT`, `SUM`, `AVG`, `GROUP BY`, `HAVING` y subconsultas |
| [U6 · SQL avanzado](u06/index.md) | `CASE`, vistas, índices, transacciones, `WITH`, funciones de ventana y *triggers* |
| [Diferencias entre motores](diferencias.md) | Qué cambia entre SQLite, MySQL, PostgreSQL y Oracle |
| [Chuleta de SQL](chuleta.md) | Las sentencias más usadas en una página |

!!! tip "Resultados reales"
    Todos los resultados que ves en las páginas se han obtenido **ejecutando el SQL** de verdad sobre **SQLite**, con una base de datos de ejemplo de un instituto (datos ficticios). Donde otros motores (MySQL, PostgreSQL, Oracle) escriben las cosas de otra forma, se indica.

!!! note "Empieza por aquí"
    Si nunca has escrito una consulta, empieza por [1.1 Bases de datos y SQL](u01/01-bases-de-datos.md): ahí está la base de datos de ejemplo y cómo crearla en tu equipo.
