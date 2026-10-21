import { courseLearning, type CourseLearningFramework } from '../../data/courseLearning';
import { aiProductCourseEvidence, productCourseEvidence } from '../../data/teachingEvidence';
import './TeachingWriting.css';

export function CourseLearningDetails({ framework }: { framework: CourseLearningFramework }) {
  const learning = courseLearning[framework];
  const platform = framework === 'AI-Native Product OS' ? aiProductCourseEvidence.udemy : productCourseEvidence;
  return <div className="teaching-learning-details">
    <p><strong>Who it is for.</strong> {learning.audience}</p>
    <h5>What you will practise</h5>
    <ul>{learning.outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ul>
    <details>
      <summary>Read a short lesson preview</summary>
      <p>{learning.preview}</p>
      <p className="teaching-learning-details__note">A written introduction to the teaching approach. Platform listings provide their own lesson previews.</p>
    </details>
    <details>
      <summary>Try a sample exercise</summary>
      <p>{learning.exercise}</p>
      <p><strong>Take away:</strong> {learning.artifact}</p>
      <a href={learning.sampleHref} target={learning.sampleHref.startsWith('https:') ? '_blank' : undefined} rel={learning.sampleHref.startsWith('https:') ? 'noopener noreferrer' : undefined}>{learning.sampleLabel} ↗</a>
      <p className="teaching-learning-details__note">A portfolio exercise based on the teaching material; platform assignments may differ.</p>
    </details>
    <div>
      <h5>Free video previews on Udemy</h5>
      <ul>{learning.platformPreviews.map((preview) => <li key={preview}>{preview}</li>)}</ul>
      <a href={platform.href} target="_blank" rel="noopener noreferrer">Open the course and select “Preview” ↗</a>
      <p className="teaching-learning-details__note">Preview availability checked on {platform.checkedLabel.replace('Checked ', '')}.</p>
    </div>
    <p className="teaching-learning-details__note">{learning.editionNote}</p>
  </div>;
}
