<script lang="ts">
  import LiquidButton from './LiquidButton.svelte';
  import ModalShell from './ModalShell.svelte';
  import { t } from '$lib/i18n';

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
    confirmLabel,
    cancelLabel,
    onconfirm,
    oncancel
  }: Props = $props();

  const resolvedConfirm = $derived(confirmLabel ?? t('common.confirm'));
  const resolvedCancel = $derived(cancelLabel ?? t('common.cancel'));
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
    <button type="button" class="modal-ghost" onclick={oncancel}>{resolvedCancel}</button>
    <LiquidButton text={resolvedConfirm} onclick={onconfirm} />
  {/snippet}
</ModalShell>
