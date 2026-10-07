# A4 · Concurrencia en la base de datos

Una base de datos real la usan **muchas personas a la vez**. Qué ocurre cuando dos de ellas tocan los mismos datos es de lo más importante, y de lo que menos se aprende leyendo. Aquí lo ves **ocurrir de verdad**: dos sesiones sobre la misma base de datos, **bloqueos**, **lecturas aisladas**, **actualizaciones perdidas** e **interbloqueos**.

## Teoría

1. [Aislamiento y bloqueos en la práctica](01-aislamiento.md)
2. [Actualizaciones perdidas e interbloqueos](02-perdidas.md)

## Antes de empezar: qué debes dominar

* La [6.4 Transacciones](../../u06/04-transacciones.md): `BEGIN`, `COMMIT`, `ROLLBACK` y ACID.
* La [unidad 3](../../u03/index.md): `UPDATE` y restricciones como `CHECK`.

## Ejercicios de la unidad

Hay [6 ejercicios](ejercicios.md) de esta unidad.

## Antes de pasar a los ejercicios

Cuando hayas leído y practicado la teoría, marca la casilla para **desbloquear** los ejercicios:

<div class="ej-check" data-unit="a4"></div>
