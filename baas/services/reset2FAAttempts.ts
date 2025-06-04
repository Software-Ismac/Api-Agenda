const reset2FAAttempts = async (KV: KVNamespace, key: string) => {
  await KV.delete(`${key}:attempts`);
};
export { reset2FAAttempts };
