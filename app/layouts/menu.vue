<template>
  <div class="relative flex min-h-screen items-center justify-center p-6">
    <UColorModeSelect class="absolute top-6 right-6" />
    <div class="w-full max-w-2xl space-y-6">
      <slot />
    </div>
  </div>
</template>
