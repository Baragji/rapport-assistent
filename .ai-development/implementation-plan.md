# Implementation Plan - Sprint 2: AI-Assist & Reference Manager

## Overview
Sprint 2 focuses on adding real user value through AI-powered writing assistance and enhanced data entry with reference management. All tasks are atomic and sized for context window limits.

## Previous Sprints Completed ✅
### Sprint 1: Foundation & Testing ✅
- [x] Development continuity system
- [x] Component refactoring (PieChart extraction)
- [x] Comprehensive testing (89% coverage, 53 tests)
- [x] CI/CD pipeline with GitHub Actions
- [x] Real DOCX export implementation

## Sprint 2: AI-Assist & Reference Manager (Estimated: 10 atomic tasks)

### Task S2.1: Install OpenAI SDK & Basic Setup
- **Estimated Time**: 15 minutes
- **Description**: Install OpenAI SDK and create basic service structure
- **Files to modify**: 
  - `package.json` (add openai dependency)
  - `src/services/aiClient.ts` (create)
  - `.env.example` (add API key template)
- **Acceptance Criteria**: 
  - OpenAI SDK installed and configured
  - Basic service structure in place
  - Environment variable setup documented
- **Test Command**: `npm install && npm run build`

### Task S2.2: Implement AI Client with Error Handling
- **Estimated Time**: 20 minutes
- **Description**: Create robust AI client with proper error handling and types
- **Files to modify**: 
  - `src/services/aiClient.ts` (enhance)
  - `src/types/ai.ts` (create)
- **Acceptance Criteria**: 
  - Complete function with error handling
  - TypeScript interfaces for AI responses
  - Fallback mechanisms for API failures
- **Test Command**: `npm run build && npm run lint`

### Task S2.3: Create Prompt Templates Structure
- **Estimated Time**: 15 minutes
- **Description**: Set up prompt template system for different report sections
- **Files to modify**: 
  - `src/prompts/` (create directory)
  - `src/prompts/reportPrompts.ts` (create)
  - `src/prompts/index.ts` (create)
- **Acceptance Criteria**: 
  - Prompt templates for different report sections
  - "Rød tråd" (red thread) suggestion prompts
  - Reusable prompt composition utilities
- **Test Command**: `npm run build`

### Task S2.4: Extend JSON Schema with References Array
- **Estimated Time**: 20 minutes
- **Description**: Add references array to report schema for RJSF rendering
- **Files to modify**: 
  - `src/schemas/report.schema.json` (modify)
  - `src/types/report.ts` (update)
- **Acceptance Criteria**: 
  - References array with author, title, url fields
  - RJSF renders add/remove UI automatically
  - TypeScript types updated accordingly
- **Test Command**: `npm test`

### Task S2.5: Update ReportForm with References UI ✅
- **Estimated Time**: 25 minutes
- **Description**: Integrate references array into ReportForm component
- **Files modified**: 
  - `src/components/ReportForm.tsx` (modified)
  - `src/components/References.tsx` (created)
  - `src/components/__tests__/References.test.tsx` (created)
  - `src/components/__tests__/ReportForm.test.tsx` (updated)
- **Acceptance Criteria**: ✅
  - ✅ References section renders in form
  - ✅ Add/remove functionality works
  - ✅ Form validation includes references
  - ✅ UI matches existing design system
- **Test Command**: `npm test`
- **Status**: Completed with 110 tests passing

### Task S2.6: Add AI-Assist Buttons to Form Sections ✅
- **Estimated Time**: 20 minutes
- **Description**: Add "Improve" buttons to form sections for AI assistance
- **Files modified**: 
  - `src/components/ReportForm.tsx` (modified)
  - `src/components/AIAssistButton.tsx` (created)
  - `src/components/__tests__/AIAssistButton.test.tsx` (created)
  - `src/components/__tests__/ReportForm.test.tsx` (updated)
- **Acceptance Criteria**: ✅
  - ✅ AI-assist buttons on relevant form fields
  - ✅ Loading states during AI processing
  - ✅ Consistent styling with form design
  - ✅ Error handling for AI generation failures
- **Test Command**: `npm test`
- **Status**: Completed with 119 tests passing

### Task S2.7: Implement AI Completion Integration ✅
- **Estimated Time**: 30 minutes
- **Description**: Connect AI client to form for content improvement
- **Files modified**: 
  - `src/hooks/useAI.ts` (created)
  - `src/components/ReportForm.tsx` (enhanced)
  - `src/components/AIAssistButton.tsx` (enhanced)
  - `src/hooks/__tests__/useAI.test.tsx` (created)
  - `src/components/__tests__/AIAssistButton.test.tsx` (updated)
  - `src/components/__tests__/ReportForm.test.tsx` (updated)
- **Acceptance Criteria**: ✅
  - ✅ AI suggestions integrate with form fields
  - ✅ Streaming responses for better UX
  - ✅ Context from references fed to AI prompts
  - ✅ Error handling for API failures
- **Test Command**: `npm test && npm run build`
- **Status**: Completed with 129 tests passing

### Task S2.8: Create Comprehensive AI Client Tests ✅
- **Estimated Time**: 25 minutes
- **Description**: Test suite for AI client and related utilities
- **Files modified**: 
  - `src/services/__tests__/aiClient.test.ts` (created)
  - `src/hooks/__tests__/useAI.test.ts` (created)
- **Acceptance Criteria**: ✅
  - ✅ Mock AI client for testing
  - ✅ Test error handling scenarios
  - ✅ Test prompt template generation
  - ✅ Coverage > 80% for AI-related code
- **Test Command**: `npm run test:coverage`
- **Status**: Completed with 189 tests passing

### Task S2.9: Implement AI Feedback Collection ✅
- **Estimated Time**: 30 minutes
- **Description**: Create feedback collection for AI-generated content
- **Files modified**: 
  - `src/components/AIFeedback.tsx` (created)
  - `src/services/feedbackService.ts` (created)
  - `src/components/AIAssistButton.tsx` (enhanced)
  - `src/components/__tests__/AIFeedback.test.tsx` (created)
  - `src/services/__tests__/feedbackService.test.ts` (created)
- **Acceptance Criteria**: ✅
  - ✅ Feedback UI for rating AI suggestions
  - ✅ Local storage for feedback persistence
  - ✅ Server submission capability
  - ✅ Integration with AIAssistButton
  - ✅ Comprehensive test coverage
- **Test Command**: `npm test && npm run build`
- **Status**: Completed with 211 tests passing

### Task S2.10: Add Usage Analytics
- **Estimated Time**: 25 minutes
- **Description**: Implement analytics for tracking AI feature usage
- **Files to modify**: 
  - `src/services/analyticsService.ts` (create)
  - `src/hooks/useAI.ts` (enhance)
  - `src/components/AIAssistButton.tsx` (enhance)
  - `src/services/__tests__/analyticsService.test.ts` (create)
- **Acceptance Criteria**: 
  - Track AI feature usage patterns
  - Collect metrics on prompt types and success rates
  - Privacy-focused analytics implementation
  - Comprehensive test coverage
- **Test Command**: `npm test && npm run build`

## Rollback Strategy
Each task creates a git commit. If a task fails or context runs out:
1. Check session-state.json for last successful checkpoint
2. Run `git reset --hard <checkpoint-commit>`
3. Update session-state.json to reflect rollback
4. Continue from last known good state

## Sprint 2 Success Metrics
- [x] All tests passing (target: 60+ tests) - Currently 211 tests passing
- [ ] Coverage > 85% overall (raised from 89.37%)
- [x] AI client functional with error handling
- [x] References array integrated in form
- [x] AI-assist buttons working in UI
- [x] Prompt templates system operational
- [x] AI completion integration with streaming responses
- [x] AI feedback collection implemented
- [x] No regression in existing functionality

## Sprint 1 Completion Summary ✅
🎉 **Sprint 1 (Foundation & Testing) completed successfully!**

### Final Sprint 1 Statistics:
- **Tests**: 53 tests passing
- **Coverage**: 89.37% overall, 100% for documentUtils.ts
- **Build**: Successful
- **Linting**: Clean (no issues)
- **CI/CD**: GitHub Actions workflow configured
- **DOCX Export**: Fully functional with comprehensive testing

### Sprint 1 Key Achievements:
1. **Component Refactoring**: Extracted PieChart component with full test coverage
2. **Comprehensive Testing**: Created extensive test suites for all components
3. **CI/CD Pipeline**: Set up GitHub Actions with proper build and test automation
4. **Real DOCX Export**: Implemented actual DOCX generation using md-to-docx library
5. **Quality Assurance**: Achieved high test coverage and clean code standards

**Sprint 1 Status**: ✅ Complete - Ready for Sprint 2: AI-Assist & Reference Manager