import ActivityKit
import SwiftUI
import WidgetKit

private struct LiveActivityIconView: View {
  var size: CGFloat

  var body: some View {
    Image("LiveActivityIcon")
      .renderingMode(.original)
      .resizable()
      .scaledToFit()
      .frame(width: size, height: size)
      .clipShape(RoundedRectangle(cornerRadius: size / 4, style: .continuous))
  }
}

private struct CompactStatusText: View {
  var text: String

  var body: some View {
    Text(text)
      .font(.caption2.weight(.semibold))
      .foregroundColor(.primary)
      .lineLimit(1)
      .minimumScaleFactor(0.7)
  }
}

struct WidgetLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: ChatAttributes.self) { context in
      HStack(spacing: 12) {
        LiveActivityIconView(size: 54)

        VStack(alignment: .leading, spacing: 4) {
          Text(context.attributes.model)
            .font(.headline)
            .foregroundColor(.secondary)

          Text(context.attributes.question)
            .font(.body)
            .lineLimit(2)
            .foregroundColor(.primary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
      }
      .padding()
    } dynamicIsland: { context in
      let shouldShowStopButton =
        (context.state.isStreaming || context.state.isThinking || context.state.isPending)
        && !context.state.isAborted

      return DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          VStack(spacing: 0) {
            Spacer(minLength: 0)
            LiveActivityIconView(size: 54)
            Spacer(minLength: 0)
          }
          .frame(maxHeight: .infinity, alignment: .center)
          .padding(.top, 10)
        }

        DynamicIslandExpandedRegion(.center) {
          VStack(spacing: 0) {
            Spacer(minLength: 0)
            VStack(alignment: .leading, spacing: 4) {
              Text(context.attributes.model)
                .font(.headline)
                .foregroundColor(.secondary)

              Text(context.attributes.question)
                .font(.body)
                .lineLimit(2)
                .foregroundColor(.primary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            Spacer(minLength: 0)
          }
          .frame(maxHeight: .infinity, alignment: .center)
        }

        DynamicIslandExpandedRegion(.trailing) {
          VStack(spacing: 0) {
            Spacer(minLength: 0)
            if shouldShowStopButton,
              let stopURL = URL(
                string: "nano-ai://?from=dynamic-island&action=stop-live-activity")
            {
              Link(destination: stopURL) {
                Image(systemName: "stop.fill")
                  .foregroundColor(.black)
                  .imageScale(.medium)
                  .padding(12)
                  .background(Color.white, in: Capsule())
              }
              .buttonStyle(.plain)
              .accessibilityLabel("Stop")
            }
            Spacer(minLength: 0)
          }
          .frame(maxHeight: .infinity, alignment: .center)
          .padding(.top, 10)
        }
      } compactLeading: {
        LiveActivityIconView(size: 24)
      } compactTrailing: {
        if context.state.isStreaming {
          CompactStatusText(text: "Responding...")
        } else if context.state.isThinking {
          CompactStatusText(text: "Thinking...")
        } else if context.state.isPending {
          CompactStatusText(text: "Waiting...")
        } else if context.state.isAborted {
          CompactStatusText(text: "Stopped")
        } else {
          Image(systemName: "checkmark.circle.fill")
            .foregroundColor(.green)
            .imageScale(.large)
        }
      } minimal: {
        LiveActivityIconView(size: 22)
      }
    }
  }
}
