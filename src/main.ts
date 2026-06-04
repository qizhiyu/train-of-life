import './style.css';
import { TrainOfLifeScene } from './scene/TrainOfLifeScene';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app mount point');
}

const shell = createSceneShell(app);
const experience = new TrainOfLifeScene(shell);
experience.start();

function createSceneShell(root: HTMLElement) {
  root.innerHTML = [
    '<section class="scene-shell"></section>',
    '<div class="scene-title">',
    '<strong>Train of Life</strong>',
    '</div>',
  ].join('');

  const shellElement = root.querySelector<HTMLElement>('.scene-shell');

  if (!shellElement) {
    throw new Error('Missing scene shell');
  }

  return shellElement;
}
