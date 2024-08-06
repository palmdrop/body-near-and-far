import { createSignal } from "solid-js";
import { Composite } from "~/components/composite/Composite";
import { FieldRenderer } from "~/components/field/FieldRenderer";
import { SequenceRenderer } from "~/components/sequence/SequenceRenderer";
import { bodyField } from "~/data/field/body";
import { earlyToLateSequence } from "~/data/sequence/early-to-late";
import { loopToUnloopSequence } from "~/data/sequence/loop-to-unloop";
import { nearToFarSequence } from "~/data/sequence/near-to-far";

export default function Home() {
  return (
    <main>
      <FieldRenderer 
        field={bodyField} 
        delay={1000} 
        subDelay={500}
        setTitle={true}
      />
      <Composite lines={["abc", "cde", "efg"]} />
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
