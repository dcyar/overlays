<script setup>
import { RouterLink, } from 'vue-router'

defineProps({
  link: {
    type: String,
    required: true,
    default: '/'
  }
})
</script>
<template>
  <div class="item">
    <RouterLink :to="link" class="link">
      <i>
        <slot name="icon"></slot>
      </i>
    </RouterLink>
    <div class="details">
      <RouterLink :to="link" class="link-text">
        <h3>
          <slot name="heading"></slot>
        </h3>
      </RouterLink>
      <p>
        <slot></slot>
      </p>
    </div>
  </div>
</template>

<style scoped>
.link {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
.item {
  margin-top: 2rem;
  display: flex;
  position: relative;
}

.link-text {
  margin: 0;
  padding: 0;
  line-height: normal;
}

.details {
  flex: 1;
  margin-left: 1rem;
  text-align: start;
}

i {
  display: flex;
  place-items: center;
  place-content: center;
  width: 32px;
  height: 32px;
  color: var(--color-text);
  background: var(--color-background);
  border-radius: 8px;
}

h3 {
  font-size: 1.2rem;
  font-weight: 500;
  margin-bottom: 0.4rem;
  color: #00bd7e;
  text-align: start;
}

p {
  color: #505050;
}

@media (min-width: 1024px) {
  .item {
    margin-top: 0;
    padding: 0.4rem 0 1rem calc(var(--section-gap) / 4);
  }

  i {
    top: calc(50% - 25px);
    left: -26px;
    position: absolute;
    border: 1px solid var(--color-border);
    background: var(--color-background);
    border-radius: 8px;
    width: 50px;
    height: 50px;
  }

  .item:before {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    bottom: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:after {
    content: ' ';
    border-left: 1px solid var(--color-border);
    position: absolute;
    left: 0;
    top: calc(50% + 25px);
    height: calc(50% - 25px);
  }

  .item:first-of-type:before {
    display: none;
  }

  .item:last-of-type:after {
    display: none;
  }
}
</style>
