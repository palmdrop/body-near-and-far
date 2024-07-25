import { createSignal } from "solid-js";
import { FieldRenderer } from "~/components/field/FieldRenderer";
import { SequenceRenderer } from "~/components/sequence/SequenceRenderer";
import { bodyField } from "~/data/field/body";
import { earlyToLateSequence } from "~/data/sequence/early-to-late";

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
      <div class="sequences">
        <SequenceRenderer
          sequence={earlyToLateSequence}
        />
        <SequenceRenderer
          sequence={earlyToLateSequence}
        />
        <SequenceRenderer
          sequence={earlyToLateSequence}
        />
      </div>
    </main>
  );
}
