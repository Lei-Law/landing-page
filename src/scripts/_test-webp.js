const webP = new Image();
webP.onload = webP.onerror = () => {
    document.querySelector('body').classList.add(webP.height === 2 ? 'webp' : 'no-webp');
};
webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';