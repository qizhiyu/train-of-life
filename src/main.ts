import './style.css';
import { TrainOfLifeScene } from './scene/TrainOfLifeScene';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Missing #app mount point');
}

const shell = createSceneShell(app);
const experience = new TrainOfLifeScene(shell);
experience.start();

createPlayControl(app, experience);

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

function createPlayControl(root: HTMLElement, scene: TrainOfLifeScene) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'play-control';

  const render = (playing: boolean) => {
    button.textContent = playing ? 'Pause' : 'Play';
    button.setAttribute('aria-label', playing ? 'Pause simulation' : 'Play simulation');
    button.setAttribute('aria-pressed', String(playing));
  };

  render(scene.isPlaying());

  button.addEventListener('click', () => {
    render(scene.togglePlaying());
  });

  root.append(button);
}
