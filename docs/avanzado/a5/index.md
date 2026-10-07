# A5 · SQL moderno

El SQL ha crecido. Hoy se **inserta o actualiza en una sola sentencia** (`UPSERT`), se **recuperan los datos modificados** al modificarlos (`RETURNING`), se **guardan y consultan documentos JSON** dentro de una columna y se declaran **columnas calculadas** por la propia base de datos. Todo esto ahorra código en la aplicación y evita fallos de concurrencia.

## Teoría

1. [UPSERT, RETURNING y copias de datos](01-upsert.md)
2. [JSON y columnas generadas](02-json.md)

## Antes de empezar: qué debes dominar

* La [unidad 3](../../u03/index.md): `INSERT`, `UPDATE`, `DELETE` y restricciones.
* La [A4.2 Actualizaciones perdidas](../a4/02-perdidas.md): por qué conviene que una sola sentencia haga todo el trabajo.

## Ejercicios de la unidad

Hay [6 ejercicios](ejercicios.md) de esta unidad.

## Antes de pasar a los ejercicios

Cuando hayas leído y practicado la teoría, marca la casilla para **desbloquear** los ejercicios:

<div class="ej-check" data-unit="a5"></div>
