# HealthySmile – Halloween Digital Toothbrush App 

## Descripció del projecte
**HealthySmile** és una aplicació d’escriptori interactiva desenvolupada amb **p5.js**, **ml5.js (FaceMesh)** i **Electron**, pensada per fomentar hàbits saludables d’higiene bucal entre el públic infantil.  
A través de la càmera web, detecta en temps real **l’obertura de la boca** i activa **animacions i partícules temàtiques de Halloween** quan l’usuari manté la boca oberta, simulant una “raspallada digital”.

### Objectius principals:
- Fomentar l’hàbit de revisar-se les dents d’una manera lúdica.  
- Utilitzar tecnologia de detecció facial en temps real.  
- Crear una experiència visual i sonora atractiva per al públic infantil.  

---

## Instal·lació
### Requisits previs
- **Node.js** versió 18 o superior  
- **npm** (gestor de paquets de Node)

### Passos d’instal·lació
1. Clona aquest repositori:
   ```bash
   git clone https://github.com/<everoro>/HealthySmile-Halloween.git
   ```
2. Entra al directori del projecte:
   ```bash
   cd HealthySmile-Halloween
   ```
3. Instal·la les dependències:
   ```bash
   npm install
   ```
4. Executa l’aplicació en mode escriptori:
   ```bash
   npm start
   ```

---

## Ús
1. En obrir l’app, apareix en **pantalla completa** (mode kiosko).  
2. Prem el botó **“Començar”** per donar permís d’accés a la càmera.  
3. Quan l’aplicació detecti la boca oberta, apareixeran **partícules i efectes** sobre la zona de la boca.  
4. Pots canviar el tema de colors, ajustar la sensibilitat o fer una captura amb els botons del panell lateral.  
5. Per tancar l’app, prem `Esc` o `Alt+F4`.

#### Exemple de codi (simplificat):
```js
if (mouthOpenRatio > threshold) {
  triggerParticles();
  playBrushSound();
}
```

---

## Funcionalitats
Detecció facial amb **ml5.js FaceMesh**  
Animacions i partícules temàtiques de **Halloween**  
Interfície interactiva amb **botons, sliders i selectors**  
Efectes de so associats a l’obertura de la boca  
Opció de **fer captures** del canvas  
Aplicació empaquetada amb **Electron** per funcionar com a app d’escriptori  

---

## Llicència
Aquest projecte està llicenciat sota la [Llicència MIT](LICENSE).


```
![Llicència](https://img.shields.io/badge/license-MIT-orange)
![Fet amb p5.js](https://img.shields.io/badge/fet%20amb-p5.js-brightgreen)
![Electron](https://img.shields.io/badge/electron-app-blue)
```

## Documentació
- [Documentació de p5.js](https://p5js.org/reference/)  
- [Referència FaceMesh (ml5.js)](https://docs.ml5js.org/#/reference/facemesh)  
- [Guia oficial d’Electron](https://www.electronjs.org/docs/latest)

---

## Canvis de versió
**v1.0.0 – Octubre 2025**  
- Versió inicial amb detecció facial i efectes de partícules.  
- Interfície d’usuari temàtica de Halloween.  
- Integració d’àudio i empaquetat amb Electron.  

---

## 🎧 Crèdits i atribucions

### Música
Music by [Tunetank](https://pixabay.com/es/users/tunetank-50201703/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=412717)  
from [Pixabay Music](https://pixabay.com/music//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=412717)

### Efectes de so
Sound Effect by [freesound_community](https://pixabay.com/es/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=34412)  
from [Pixabay Sound Effects](https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=34412)

---

## Conclusió
Aquesta aplicació converteix la higiene dental en una experiència divertida i visual, combinant tecnologia i disseny lúdic.  
Feta amb creativitat, **JavaScript** i esperit de **Halloween** 🎃🦷✨  
