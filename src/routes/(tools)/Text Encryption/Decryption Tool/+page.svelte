<script>
  import { encrypt, decrypt } from '../lib/encryption';

  let textToEncrypt = '';
  let password = '';
  let encryptedText = '';

  function handleEncrypt() {
    encryptedText = encrypt(textToEncrypt, password);
  }

  function handleDecrypt() {
    textToEncrypt = decrypt(encryptedText, password);
  }
</script>

<input bind:value={textToEncrypt} type="text" placeholder="Text to encrypt" />
<input bind:value={password} type="password" placeholder="Password" />
<button on:click={handleEncrypt}>Encrypt</button>
<button on:click={handleDecrypt}>Decrypt</button>
<p>Encrypted Text: {encryptedText}</p>
<p>Decrypted Text: {textToEncrypt}</p>
