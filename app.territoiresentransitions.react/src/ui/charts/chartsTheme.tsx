import {Theme} from '@nivo/core';

export const theme: Theme = {
  fontFamily: '"Marianne", arial, sans-serif',
  fontSize: 12,
  axis: {
    legend: {
      text: {
        fontFamily: '"Marianne", arial, sans-serif',
        fontSize: 14,
      },
    },
  },
  legends: {
    text: {
      fontSize: 12,
    },
  },
  tooltip: {
    container: {
      fontSize: 14,
      background: '#fff',
      padding: '9px 12px',
      border: '1px solid #ccc',
    },
  },
};

export const defaultColors = [
  '#21AB8E',
  '#FFCA00',
  '#FF732C',
  '#34BAB5',
  '#FFB7AE',
];

export const enum StatusColor {
  'Abandonné' = '#F95C5E',
  'En pause' = '#FF9575',
  'A venir' = '#7AB1E8',
  'En cours' = '#869ECE',
  'Réalisé' = '#34CB6A',
}
