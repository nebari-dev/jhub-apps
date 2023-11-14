import { JupyterHubApp } from '../types/app';
export const apps: JupyterHubApp[] = [
  {
    id: '1',
    name: 'Awesome App 1',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    appType: 'Gradio',
    imgUrl:
      'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
    shared: false,
  },
  {
    id: '2',
    name: 'Awesome App 2',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    appType: 'Panel',
    imgUrl:
      'https://designsystem.digital.gov/img/introducing-uswds-2-0/built-to-grow--alt.jpg',
    shared: false,
  },
  {
    id: '3',
    name: 'Awesome App 3',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    appType: 'Some Framework',
    shared: false,
  },
  {
    id: '4',
    name: 'Awesome App 4',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    appType: 'Some Framework',
    shared: false,
  },
  {
    id: '5',
    name: 'Awesome App 5',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    appType: 'Some Framework',
    shared: false,
  },
  {
    id: '6',
    name: 'Awesome App 6',
    description:
      'Lorem ipsum dolor sit amet consectetur. Sit vestibulum facilisis auctor pulvinar ac. Cras.',
    appType: 'Some Framework',
    shared: true,
  },
];
