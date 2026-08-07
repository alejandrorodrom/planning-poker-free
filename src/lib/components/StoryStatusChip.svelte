<script lang="ts">
  import type { StoryStatus } from '$lib/room/protocol';
  import { storyStatusLabel } from '$lib/room/storyStatus';

  type Props = {
    status: StoryStatus | string;
    suffix?: string;
    tone?: 'stories' | 'results';
  };

  let { status, suffix, tone = 'stories' }: Props = $props();
</script>

<span class="chip chip--{status} chip--tone-{tone}">
  {storyStatusLabel(status)}{#if suffix}{' '}{suffix}{/if}
</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 9px;
    border-radius: 999px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.02em;
    white-space: nowrap;
    border: 1px solid transparent;
  }

  .chip--tone-results {
    padding: 4px 10px;
    font-weight: 700;
  }

  .chip--tone-stories.chip--pending {
    background: rgba(161, 161, 161, 0.18);
    color: #555;
  }

  .chip--tone-stories.chip--voting {
    background: rgba(255, 153, 0, 0.18);
    color: #a65f00;
  }

  .chip--tone-stories.chip--estimated {
    background: rgba(54, 168, 72, 0.16);
    color: #1f7a2e;
  }

  .chip--tone-stories.chip--skipped {
    background: rgba(247, 56, 96, 0.12);
    color: #a01a3a;
  }

  .chip--tone-results.chip--pending {
    background: #eef4f6;
    color: var(--color-brand-dark);
    border-color: var(--color-brand-soft);
  }

  .chip--tone-results.chip--voting {
    background: rgba(33, 172, 195, 0.16);
    color: var(--color-brand-dark);
    border-color: var(--color-brand-soft);
  }

  .chip--tone-results.chip--estimated {
    background: rgba(54, 168, 72, 0.14);
    color: #1f7a2d;
    border-color: rgba(54, 168, 72, 0.35);
  }

  .chip--tone-results.chip--skipped {
    background: #f2f2f2;
    color: #666;
    border-color: #ddd;
  }
</style>
