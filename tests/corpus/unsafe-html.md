# Unsafe HTML

<script>window.evil = true</script>

<iframe src="https://example.com"></iframe>

<p onclick="window.evil = true">Allowed text, stripped handler.</p>

<img src="./images/sample-photo.svg" onerror="window.evil = true" />
