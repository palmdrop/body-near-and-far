import { createSignal } from "solid-js";
import { FieldRenderer } from "~/components/field/FieldRenderer";
import { SequenceRenderer } from "~/components/sequence/SequenceRenderer";
import { bodyField } from "~/data/field/body";
import { earlyToLateSequence } from "~/data/sequence/early-to-late";
import { loopToUnloopSequence } from "~/data/sequence/loop-to-unloop";
import { nearToFarSequence } from "~/data/sequence/near-to-far";

export default function Home() {
  const [count, setCount] = createSignal(0)

  setInterval(() => {
    setCount(count() + 1);
  }, 500);

  return (
    <main>
      <FieldRenderer 
        field={bodyField} 
        delay={500} 
        subDelay={300}
        setTitle={true}
      />
      { /*
      <article class="main-block">
        floating block of glyphs
      </article>
      */ }
      <div class="sequences">
        <SequenceRenderer
          sequence={earlyToLateSequence}
        />
        <SequenceRenderer
          sequence={nearToFarSequence}
        />
        <SequenceRenderer
          sequence={loopToUnloopSequence}
        />
      </div>
    </main>
  );
}
