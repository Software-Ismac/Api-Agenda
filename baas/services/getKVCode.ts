const getKVCode = async (
  KV: KVNamespace,
  key: string,
  confirmationCod: string
) => {
  const storedValue = await KV.get(key);
  if (!storedValue) return null;

  const { expirationTtl, confirmationCode } = JSON.parse(storedValue);
  const currentTime = Math.floor(Date.now() / 1000);

  if (currentTime > expirationTtl) {
    await KV.delete(key);
    return null;
  }
  if (confirmationCod == confirmationCode) {
    return true;
  }

  return false;
};
export { getKVCode };
