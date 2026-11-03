// The cascade layer order, as the first <style> in <head>, before any component CSS loads. Base.astro inlines
// the same file on the site because bundle order isn't guaranteed. Imported first by preview.tsx.
import layers from '../src/styles/layers.css?raw';

const style = document.createElement('style');
style.textContent = layers;
document.head.prepend(style);
