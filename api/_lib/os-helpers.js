const crypto = require('crypto');

const id = (value) => {
  const normalized = String(value || '').trim();
  return normalized || crypto.randomUUID();
};

const text = (value, fallback = '') => String(value ?? fallback).trim();
const nullableText = (value) => {
  const normalized = text(value);
  return normalized || null;
};
const integer = (value, fallback = null) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isInteger(number) ? number : fallback;
};
const decimal = (value, fallback = null) => {
  if (value === '' || value === null || value === undefined) return fallback;
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const bool = (value, fallback = false) => {
  if (value === undefined || value === null) return fallback;
  return value === true || value === 'true' || value === 1 || value === '1';
};
const jsonArray = (value) => Array.isArray(value) ? value : [];
const jsonObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

module.exports = { bool, decimal, id, integer, jsonArray, jsonObject, nullableText, text };
