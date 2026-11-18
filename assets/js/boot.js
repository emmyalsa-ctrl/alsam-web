/* ALSAM · Se carga en <head> sin defer: marca que hay JS antes del primer pintado
   para que las animaciones de entrada no produzcan parpadeos. */
document.documentElement.classList.add("js");
