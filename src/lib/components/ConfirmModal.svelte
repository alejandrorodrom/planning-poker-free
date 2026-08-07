<script lang="ts">
  import LiquidButton from './LiquidButton.svelte';
  import ModalShell from './ModalShell.svelte';

  type Props = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onconfirm: () => void;
    oncancel: () => void;
  };

  let {
    open,
    title,
    description,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onconfirm,
    oncancel
  }: Props = $props();
</script>

<ModalShell
  {open}
  {title}
  titleId="confirm-modal-title"
  {description}
  size="sm"
  variant="simple"
  onclose={oncancel}
>
  {#snippet footer()}
    <button type="button" class="modal-ghost" onclick={oncancel}>{cancelLabel}</button>
    <LiquidButton text={confirmLabel} onclick={onconfirm} />
  {/snippet}
</ModalShell>
